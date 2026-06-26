import { Library } from "lucide-react";

import { GlowyWavesHero } from "@/components/uitripled/glowy-waves-hero-shadcnui";
import {
  ImageSliderCard,
  type ImageSliderCardSlide,
} from "@/components/uitripled/image-slider-card-shadcnui";
import { PreviewDetailsCard } from "@/components/uitripled/preview-details-card-shadcnui";
import { PageSection } from "@/components/xmeta/app-shell";

const featureSlides: ImageSliderCardSlide[] = [
  {
    id: "quick-start",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80",
    imageAlt: "A bright creative production desk with video editing screens.",
    title: "Fast",
    description:
      "Start from a brief and shape a storyboard direction before any generation runs.",
  },
  {
    id: "assets-library",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=900&q=80",
    imageAlt: "A tidy grid of visual assets on a designer workspace.",
    title: "Assets Library",
    description:
      "Organize planned characters, scenes, audio, and clips as reusable production assets.",
  },
  {
    id: "modular-pipeline",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80",
    imageAlt:
      "Connected workflow notes and media previews for a modular pipeline.",
    title: "Block-Based Pipeline",
    description:
      "Connect script, image, audio, video, and export steps as visible workflow blocks.",
  },
];

const entryCards = [
  {
    eyebrow: "Narrative workflow",
    title: "Comic Drama Creation",
    summary: "Story-driven canvas entry",
    description:
      "Plan a comic drama path from premise, characters, scenes, and storyboard beats into a visible node workflow.",
    ctaLabel: "Start Comic Drama",
    icon: "panels" as const,
  },
  {
    eyebrow: "Music video workflow",
    title: "MV Creation",
    summary: "Rhythm-driven canvas entry",
    description:
      "Outline an MV path around lyrics, visual rhythm, reusable assets, audio direction, and clip sequencing.",
    ctaLabel: "Start MV",
    icon: "film" as const,
  },
];

const heroStats = [
  { label: "Creative paths", value: "2" },
  { label: "Feature slides", value: "3" },
  { label: "Canvas model", value: "Nodes" },
] as const;

export default function HomePage() {
  return (
    <div className="scroll-smooth bg-[radial-gradient(circle_at_50%_0%,hsl(var(--muted-hsl))_0%,hsl(var(--background-hsl))_34%,hsl(var(--background-hsl))_100%)]">
      <GlowyWavesHero
        eyebrow="X-META Video"
        title="AI comic drama and MV"
        titleHighlight="creation workspace"
        description="Build creative production flows on a canvas by arranging script, storyboard, asset, audio, video, and export nodes before connected backend services are added."
        primaryAction={{ href: "#creation-entries", label: "Launch Studio" }}
        secondaryAction={{
          href: "/tripled-test",
          label: "Open TriplD gallery",
        }}
        highlightPills={["Fast", "Assets Library", "Block-Based Pipeline"]}
        stats={heroStats}
        className="min-h-[88vh] bg-transparent"
      />

      <PageSection className="bg-transparent">
        <div className="grid w-full gap-10 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <div className="flex size-10 items-center justify-center rounded-md bg-background text-primary shadow-sm">
              <Library aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
                Feature preview
              </p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Three practical entry promises
              </h2>
              <p className="text-base leading-7 text-muted-foreground">
                The slider frames the production model without claiming live AI
                tasks, saved projects, or media generation are available.
              </p>
            </div>
          </div>

          <ImageSliderCard slides={featureSlides} showSlideLabels={false} />
        </div>
      </PageSection>

      <PageSection
        id="creation-entries"
        aria-labelledby="creation-entries-title"
        className="scroll-mt-20"
      >
        <div className="flex max-w-3xl flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
            Studio entries
          </p>
          <h2
            id="creation-entries-title"
            className="text-3xl font-semibold tracking-tight"
          >
            Choose a creation direction
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            These cards route into planned workflows; they do not create, store,
            or export media.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {entryCards.map((entry) => (
            <PreviewDetailsCard
              key={entry.title}
              eyebrow={entry.eyebrow}
              title={entry.title}
              summary={entry.summary}
              description={entry.description}
              ctaLabel={entry.ctaLabel}
              href="#creation-entries"
              icon={entry.icon}
            />
          ))}
        </div>
      </PageSection>
    </div>
  );
}
