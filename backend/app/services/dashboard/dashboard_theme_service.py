from copy import deepcopy
from typing import Any


class DashboardThemeService:
    """
    Provides reusable visual themes for
    generated dashboard designs.

    These values are sent to the frontend,
    which uses them to style the report canvas,
    widgets, charts, slicers, and text.
    """

    THEMES: dict[str, dict[str, Any]] = {
        "executive_dark": {
            "name": "executive_dark",
            "background": "#08111f",
            "surface": "#0f1b2d",
            "surface_secondary": "#16243a",
            "text_primary": "#f8fafc",
            "text_secondary": "#94a3b8",
            "accent": "#38bdf8",
            "accent_secondary": "#8b5cf6",
            "border": "#22314a",
        },

        "powerbi_classic": {
            "name": "powerbi_classic",
            "background": "#f4f7fb",
            "surface": "#ffffff",
            "surface_secondary": "#eef3f8",
            "text_primary": "#1f2937",
            "text_secondary": "#64748b",
            "accent": "#118dff",
            "accent_secondary": "#e66c37",
            "border": "#d9e2ec",
        },

        "modern_light": {
            "name": "modern_light",
            "background": "#f8fafc",
            "surface": "#ffffff",
            "surface_secondary": "#f1f5f9",
            "text_primary": "#0f172a",
            "text_secondary": "#64748b",
            "accent": "#0ea5e9",
            "accent_secondary": "#14b8a6",
            "border": "#e2e8f0",
        },

        "analytics_blue": {
            "name": "analytics_blue",
            "background": "#071a2b",
            "surface": "#0d2840",
            "surface_secondary": "#113451",
            "text_primary": "#f8fafc",
            "text_secondary": "#a5bfd4",
            "accent": "#22d3ee",
            "accent_secondary": "#3b82f6",
            "border": "#1d4564",
        },

        "minimal_pro": {
            "name": "minimal_pro",
            "background": "#f6f7f9",
            "surface": "#ffffff",
            "surface_secondary": "#f0f2f5",
            "text_primary": "#111827",
            "text_secondary": "#6b7280",
            "accent": "#4f46e5",
            "accent_secondary": "#7c3aed",
            "border": "#e5e7eb",
        },
    }

    @classmethod
    def get_theme(
        cls,
        name: str,
    ) -> dict[str, Any]:
        """
        Return one theme by name.
        """

        theme = cls.THEMES.get(
            name
        )

        if theme is None:
            raise ValueError(
                f"Unknown dashboard theme: {name}"
            )

        return deepcopy(
            theme
        )

    @classmethod
    def get_all_themes(
        cls,
    ) -> dict[str, dict[str, Any]]:
        """
        Return all available themes.
        """

        return deepcopy(
            cls.THEMES
        )

    @classmethod
    def exists(
        cls,
        name: str,
    ) -> bool:
        return name in cls.THEMES