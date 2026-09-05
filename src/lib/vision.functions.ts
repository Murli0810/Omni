import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const KINDS = [
  "pothole",
  "damaged_road",
  "missing_divider",
  "missing_zebra",
  "signboard",
  "waterlogging",
  "vehicle",
  "bottleneck",
  "pedestrian",
  "school_zone",
  "rash_driving",
  "hit_and_run",
] as const;

const VEHICLE_CLASSES = ["car", "bus", "truck", "two_wheeler"] as const;

const FrameInput = z.object({
  image: z.string().min(64), // data:image/jpeg;base64,...
  threshold: z.number().min(0).max(100).default(50),
  width: z.number().positive().default(768),
  height: z.number().positive().default(432),
});

const DetectionSchema = z.object({
  kind: z.enum(KINDS),
  vehicle_class: z.enum(VEHICLE_CLASSES).nullish(),
  box: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }),
  confidence: z.number(),
  plate: z.string().nullish(),
  plate_confidence: z.number().nullish(),
  speed_kph: z.number().nullish(),
  note: z.string().nullish(),
});

const ResultSchema = z.object({
  detections: z.array(DetectionSchema).max(14),
  scene: z.string().nullish(),
  bottleneck: z.boolean().nullish(),
});

export type FrameDetection = z.infer<typeof DetectionSchema>;

const MODEL = "google/gemini-3.1-flash-lite";

const SYSTEM = `You are URBAN-INTEL EDGE-VISION, a road inspection perception model tuned for Indian city roads (Jamshedpur, Jharkhand). You analyse a single dashcam/bus-camera frame and return only detections you can actually see.

Detection vocabulary (field "kind"):
- pothole: visible cavity/broken patch in the carriageway
- damaged_road: cracked, eroded, unsurfaced or heavily rutted road
- missing_divider: absent or broken median/central divider on a divided road
- missing_zebra: junction/crossing with worn-off or absent zebra markings
- signboard: damaged, bent, faded or missing traffic signboard
- waterlogging: standing water, flooded stretch or large puddle
- vehicle: each clearly visible vehicle (set vehicle_class: car | bus | truck | two_wheeler)
- pedestrian: person walking on/near the carriageway
- school_zone: school children, school bus or school-zone signage near the road
- rash_driving: wrong-side driving, illegal overtaking, red-light jumping, lane weaving, dangerous overloading
- hit_and_run: visible collision or a vehicle fleeing a collision scene
- bottleneck: dense stalled traffic / choke point

Rules:
1. box is a tight bounding box in PIXEL coordinates of the supplied frame, which is {width} x {height} pixels: x,y = top-left corner, w,h = width and height. Never exceed the frame bounds.
2. confidence is your true visual certainty as a percentage 0-100. Do not inflate. Omit anything below ${"{threshold}"}.
3. plate: only when licence-plate characters are genuinely legible. Return them uppercase with no spaces in Indian format (e.g. JH05AB1234). Set plate_confidence to your OCR certainty. If unreadable, set plate to null — never guess or invent a plate.
4. speed_kph: rough estimate only for vehicles flagged rash_driving or hit_and_run; otherwise null.
5. Report at most 12 detections, prioritising hazards and critical events over ordinary vehicles.
6. Indian road context matters: mixed traffic, two-wheelers, autorickshaws (classify as car if three-wheeled taxi), cattle/handcarts near the carriageway count as pedestrian-class risk.
7. Return STRICT JSON only, no markdown, no commentary:
{"scene":"short description","bottleneck":true|false,"detections":[{"kind":"...","vehicle_class":null,"box":{"x":0,"y":0,"w":0,"h":0},"confidence":0,"plate":null,"plate_confidence":null,"speed_kph":null,"note":null}]}
If the frame is blank, dark, or unreadable, return {"scene":"no usable frame","bottleneck":false,"detections":[]}.`;

function stripFences(text: string) {
  const t = text.trim();
  if (!t.startsWith("```")) return t;
  return t
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

export const analyzeFrame = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => FrameInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) {
      return { ok: false as const, status: 401, error: "AI gateway key is not configured." };
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        messages: [
          { role: "system", content: SYSTEM.replace("{threshold}", String(data.threshold))
              .replace("{width}", String(Math.round(data.width)))
              .replace("{height}", String(Math.round(data.height))) },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyse this bus dashcam frame (${Math.round(data.width)}x${Math.round(data.height)} px). Confidence threshold: ${data.threshold}%. Box coordinates in pixels. Return strict JSON.`,
              },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      let message = body.slice(0, 300);
      try {
        const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string };
        message = parsed.error?.message ?? parsed.message ?? message;
      } catch {
        /* keep raw text */
      }
      const retryAfter = res.headers.get("retry-after");
      return {
        ok: false as const,
        status: res.status,
        error: message || `Inference failed (${res.status})`,
        ...(retryAfter ? { retryAfterSec: Number(retryAfter) || 5 } : {}),
      };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = ResultSchema.parse(JSON.parse(stripFences(raw)));
      return {
        ok: true as const,
        scene: parsed.scene ?? null,
        bottleneck: parsed.bottleneck ?? false,
        detections: parsed.detections
          .filter((d) => d.confidence >= Math.min(data.threshold, 100) - 0.001)
          .map((d) => ({
            ...d,
            // Models answer in pixels; normalise to 0..1 for the renderer.
            box: {
              x: d.box.x / data.width,
              y: d.box.y / data.height,
              w: d.box.w / data.width,
              h: d.box.h / data.height,
            },
          })),
      };
    } catch {
      return {
        ok: false as const,
        status: 422,
        error: "Model returned an unreadable perception payload for this frame.",
      };
    }
  });
