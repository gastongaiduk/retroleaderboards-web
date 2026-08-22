import posthog from "posthog-js";

let initialized = false;
let identifiedUserId: string | null = null;

export function initPostHog(): void {
  const projectToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;
  const host = import.meta.env.VITE_POSTHOG_HOST;

  if (!projectToken || !host) {
    return;
  }

  posthog.init(projectToken, {
    api_host: host,
    capture_pageview: false,
    capture_pageleave: true,
  });
  initialized = true;
}

export function capturePageview(path: string): void {
  if (!initialized) {
    return;
  }
  posthog.capture("$pageview", { path });
}

export function captureEvent(
  name: string,
  properties?: Record<string, unknown>,
): void {
  if (!initialized) {
    return;
  }
  posthog.capture(name, properties);
}

export function identifyUser(userId: string): void {
  if (!initialized || userId === identifiedUserId) {
    return;
  }
  posthog.identify(userId);
  identifiedUserId = userId;
}

export function resetUser(): void {
  if (!initialized) {
    return;
  }
  posthog.reset();
  identifiedUserId = null;
}
