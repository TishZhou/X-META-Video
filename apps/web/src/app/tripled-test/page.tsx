"use client";

import dynamic from "next/dynamic";

import { AIChatInterface } from "@/components/uitripled/ai-chat-interface-shadcnui";
import { AIResponseTyping } from "@/components/uitripled/ai-response-typing-shadcnui";
import { CardsSlider } from "@/components/uitripled/cards-slider-shadcnui";
import { CommandPalette } from "@/components/uitripled/command-palette-shadcnui";
import { GlowyWavesHero } from "@/components/uitripled/glowy-waves-hero-shadcnui";
import { ImageSliderCard } from "@/components/uitripled/image-slider-card-shadcnui";
import { NativeButton } from "@/components/uitripled/native-button-shadcnui";
import {
  NativeDialog,
  NativeDialogContent,
  NativeDialogDescription,
  NativeDialogHeader,
  NativeDialogTitle,
  NativeDialogTrigger,
} from "@/components/uitripled/native-dialog-shadcnui";
import { NativeHoverCard } from "@/components/uitripled/native-hover-card-shadcnui";
import { NativeMagnetic } from "@/components/uitripled/native-magnetic-shadcnui";
import { NativeStartNow } from "@/components/uitripled/native-start-now-shadcnui";
import {
  NativeTooltip,
  NativeTooltipProvider,
} from "@/components/uitripled/native-tooltip-shadcnui";
import { NativeTypewriter } from "@/components/uitripled/native-typewriter-shadcnui";
import { PreviewDetailsCard } from "@/components/uitripled/preview-details-card-shadcnui";

const DynamicTagCloud = dynamic(
  () =>
    import("@/components/uitripled/dynamic-tag-cloud-shadcnui").then(
      (module) => module.DynamicTagCloud,
    ),
  { ssr: false },
);

const productionTags = [
  { id: "script", label: "Script" },
  { id: "storyboard", label: "Storyboard" },
  { id: "character", label: "Character" },
  { id: "scene", label: "Scene" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
];

export default function HomePage() {
  return (
    <NativeTooltipProvider>
      <main
        className="min-h-screen overflow-x-hidden bg-background text-foreground"
        data-tripled-gallery="all-components"
        data-tripled-ui="original"
      >
        <section data-tripled-sample="glowy-waves-hero">
          <GlowyWavesHero />
        </section>

        <section
          aria-label="TriplD UI component samples"
          className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:px-8 lg:px-10"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              TriplD UI
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
              Imported component samples
            </h1>
            <div className="min-h-8 text-lg text-muted-foreground">
              <NativeTypewriter
                className="text-foreground"
                content={[
                  "Glowy waves, magnetic controls, dialogs, cards, sliders.",
                  "Each sample uses the imported TriplD component directly.",
                ]}
                loop
                speed="fast"
              />
            </div>
          </div>

          <section
            className="flex flex-col gap-6"
            data-tripled-sample="native-controls"
          >
            <h2 className="text-xl font-semibold">Native controls</h2>
            <div className="flex flex-wrap items-center gap-4">
              <NativeButton glow type="button">
                Native Button
              </NativeButton>
              <NativeStartNow
                label="Native Start Now"
                loadingLabel="Starting sample..."
                onStart={() =>
                  new Promise((resolve) => window.setTimeout(resolve, 500))
                }
                successLabel="Started"
              />
              <NativeTooltip content="Native Tooltip sample">
                <button
                  className="h-12 rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                  type="button"
                >
                  Native Tooltip
                </button>
              </NativeTooltip>
              <NativeMagnetic
                className="rounded-md border border-border bg-background px-5 py-3 text-sm font-medium text-foreground shadow-sm"
                strength={0.22}
              >
                Native Magnetic
              </NativeMagnetic>
              <NativeDialog>
                <NativeDialogTrigger asChild>
                  <button
                    className="h-12 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    type="button"
                  >
                    Native Dialog
                  </button>
                </NativeDialogTrigger>
                <NativeDialogContent>
                  <NativeDialogHeader>
                    <NativeDialogTitle>Native Dialog sample</NativeDialogTitle>
                    <NativeDialogDescription>
                      This dialog is rendered from the imported TriplD native
                      dialog component.
                    </NativeDialogDescription>
                  </NativeDialogHeader>
                </NativeDialogContent>
              </NativeDialog>
            </div>
          </section>

          <section
            className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]"
            data-tripled-sample="text-and-tags"
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold">Typewriter</h2>
              <div className="rounded-md border border-border bg-muted/40 p-5 text-lg">
                <NativeTypewriter
                  content={[
                    "Native Typewriter sample.",
                    "Animated text from TriplD.",
                  ]}
                  loop
                  speed="fast"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold">Dynamic Tag Cloud</h2>
              <DynamicTagCloud tags={productionTags} />
            </div>
          </section>

          <section className="grid gap-10 lg:grid-cols-2">
            <div
              className="flex flex-col gap-4"
              data-tripled-sample="command-palette"
            >
              <h2 className="text-xl font-semibold">Command Palette</h2>
              <CommandPalette />
            </div>

            <div
              className="flex flex-col gap-4"
              data-tripled-sample="ai-response-typing"
            >
              <h2 className="text-xl font-semibold">AI Response Typing</h2>
              <AIResponseTyping
                speed={18}
                text="Drafting a shot list, matching character continuity, and preparing export checkpoints."
              />
            </div>
          </section>

          <section
            className="flex flex-col gap-4"
            data-tripled-sample="ai-chat-interface"
          >
            <h2 className="text-xl font-semibold">AI Chat Interface</h2>
            <AIChatInterface />
          </section>

          <section className="grid gap-10 lg:grid-cols-2">
            <div
              className="flex flex-col gap-4"
              data-tripled-sample="native-hover-card"
            >
              <h2 className="text-xl font-semibold">Native Hover Card</h2>
              <NativeHoverCard
                buttonText="Hover sample"
                description="This is the imported TriplD hover card component."
                imageAlt="Hover card sample"
                imageSrc="/icon.svg"
                name="Native Hover Card"
                size="xl"
                username="tripled-hover"
                variant="glass"
              />
            </div>

            <div
              className="flex flex-col gap-4"
              data-tripled-sample="preview-details-card"
            >
              <h2 className="text-xl font-semibold">Preview Details Card</h2>
              <PreviewDetailsCard />
            </div>
          </section>

          <section
            className="flex flex-col gap-4"
            data-tripled-sample="image-slider-card"
          >
            <h2 className="text-xl font-semibold">Image Slider Card</h2>
            <ImageSliderCard />
          </section>

          <section
            className="flex flex-col gap-4 overflow-hidden"
            data-tripled-sample="cards-slider"
          >
            <h2 className="text-xl font-semibold">Cards Slider</h2>
            <CardsSlider />
          </section>
        </section>
      </main>
    </NativeTooltipProvider>
  );
}
