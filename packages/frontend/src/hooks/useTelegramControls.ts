// src/hooks/useTelegramControls.ts
"use client";

import { useEffect } from "react";
import {
  useMainButton,
  useBackButton,
  useHapticFeedback,
} from "@telegram-apps/sdk-react";

interface MainButtonOptions {
  text: string;
  onClick: () => void;
  enabled?: boolean;
  visible?: boolean;
  color?: string;
}

/** Declaratively syncs Telegram's native MainButton to the current quiz step. */
export function useMainButtonControl({
  text,
  onClick,
  enabled = true,
  visible = true,
  color,
}: MainButtonOptions) {
  const mainButton = useMainButton();

  useEffect(() => {
    mainButton.setText(text);
    enabled ? mainButton.enable() : mainButton.disable();
    if (color) mainButton.setBgColor(color as `#${string}`);

    const handler = () => onClick();
    mainButton.on("click", handler);

    if (visible) mainButton.show();
    else mainButton.hide();

    return () => {
      mainButton.off("click", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, enabled, visible, onClick]);

  useEffect(() => () => mainButton.hide(), [mainButton]);
}

/** Wires Telegram's native BackButton to a navigation callback (e.g. category list). */
export function useBackButtonControl(onBack: () => void, visible = true) {
  const backButton = useBackButton();

  useEffect(() => {
    const handler = () => onBack();
    backButton.on("click", handler);
    visible ? backButton.show() : backButton.hide();

    return () => {
      backButton.off("click", handler);
      backButton.hide();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBack, visible]);
}

/** Thin helper for haptic feedback hints on answer submission. */
export function useHaptics() {
  const haptic = useHapticFeedback();
  return {
    tapLight: () => haptic.impactOccurred("light"),
    success: () => haptic.notificationOccurred("success"),
    error: () => haptic.notificationOccurred("error"),
  };
}
