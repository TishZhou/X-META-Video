"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type KeyboardEvent, useId, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ImageSliderCardSlide {
  id: string;
  image: string;
  imageAlt: string;
  title: string;
  description: string;
}

interface ImageSliderCardProps {
  slides?: ImageSliderCardSlide[];
  ariaLabel?: string;
  className?: string;
  showSlideLabels?: boolean;
}

const defaultSlides: ImageSliderCardSlide[] = [
  {
    id: "quick-start",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80",
    imageAlt: "A bright creative production desk with video editing screens.",
    title: "Quick Start",
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
    title: "Modular Pipeline",
    description:
      "Connect script, image, audio, video, and export steps as visible workflow blocks.",
  },
];

export function ImageSliderCard({
  slides = defaultSlides,
  ariaLabel = "X-META Video feature carousel",
  className,
  showSlideLabels = false,
}: ImageSliderCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const headingId = useId();
  const descriptionId = useId();
  const slideCount = slides.length;
  const currentSlide = slides[currentIndex] ?? slides[0];

  const imageVariants = useMemo((): Variants => {
    if (shouldReduceMotion) {
      return {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    return {
      enter: { opacity: 0, scale: 0.98 },
      center: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.02 },
    };
  }, [shouldReduceMotion]);

  const paginate = (newDirection: number) => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) return slideCount - 1;
      if (nextIndex >= slideCount) return 0;
      return nextIndex;
    });
  };

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowLeft": {
        event.preventDefault();
        paginate(-1);
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        paginate(1);
        break;
      }
      case "Home": {
        event.preventDefault();
        goToSlide(0);
        break;
      }
      case "End": {
        event.preventDefault();
        goToSlide(slideCount - 1);
        break;
      }
      default:
        break;
    }
  };

  if (!currentSlide) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
      className={cn("w-full", className)}
    >
      <Card
        className="overflow-hidden rounded-lg border-border/80 bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
        role="group"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        aria-live="polite"
        aria-atomic="true"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <CardContent className="relative h-72 overflow-hidden bg-muted p-0 sm:h-80 lg:h-96">
          <AnimatePresence initial={false} mode="wait">
            <motion.img
              key={currentSlide.id}
              src={currentSlide.image}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: shouldReduceMotion ? 0 : 0.35,
                ease: "easeInOut",
              }}
              className="absolute inset-0 size-full object-cover transition-opacity"
              alt={currentSlide.imageAlt}
              aria-describedby={descriptionId}
              aria-labelledby={headingId}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => paginate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft data-icon="inline-start" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => paginate(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-sm"
            aria-label="Next slide"
          >
            <ChevronRight data-icon="inline-start" aria-hidden="true" />
          </Button>

          <span className="sr-only" role="status">
            Slide {currentIndex + 1} of {slideCount}
          </span>
        </CardContent>

        <CardHeader className="gap-3 border-t border-border/70 p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
              role="tabpanel"
              aria-labelledby={headingId}
              id={`slide-panel-${currentSlide.id}`}
              className="flex flex-col gap-2"
            >
              <CardTitle
                id={headingId}
                className="text-2xl leading-tight text-foreground"
              >
                {currentSlide.title}
              </CardTitle>
              <CardDescription
                id={descriptionId}
                className="text-base leading-7"
                aria-live="polite"
              >
                {currentSlide.description}
              </CardDescription>
            </motion.div>
          </AnimatePresence>

          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Slide navigation"
          >
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    showSlideLabels
                      ? "min-h-9 rounded-md border px-3 py-2 text-left text-xs font-medium leading-5 sm:text-sm"
                      : "h-1.5 rounded-full",
                    isActive
                      ? cn(
                          "bg-primary shadow-sm",
                          showSlideLabels
                            ? "border-primary text-primary-foreground"
                            : "w-8",
                        )
                      : cn(
                          "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                          showSlideLabels ? "border-border" : "w-2 border-0",
                        ),
                  )}
                  aria-label={`Go to ${slide.title}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`slide-panel-${slide.id}`}
                  tabIndex={isActive ? 0 : -1}
                  id={`slide-tab-${slide.id}`}
                >
                  {showSlideLabels ? (
                    slide.title
                  ) : (
                    <span className="sr-only">{slide.title}</span>
                  )}
                </button>
              );
            })}
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
