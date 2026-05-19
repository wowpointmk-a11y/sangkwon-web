"use client";

import { useEffect, useRef, useState } from "react";
import { Input, Label } from "@/components/ui/input";
import type { PlaceSuggestion } from "@/app/api/places/search/route";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onPick?: (s: PlaceSuggestion) => void;
  required?: boolean;
}

export function BizNameAutocomplete({
  value,
  onChange,
  onPick,
  required,
}: Props) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 디바운스 검색
  useEffect(() => {
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      abortRef.current?.abort();
      const ctl = new AbortController();
      abortRef.current = ctl;
      setLoading(true);
      fetch(`/api/places/search?q=${encodeURIComponent(value.trim())}`, {
        signal: ctl.signal,
      })
        .then((r) => r.json())
        .then((d: { suggestions: PlaceSuggestion[] }) => {
          setSuggestions(d.suggestions ?? []);
          setActiveIdx(0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [value]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (s: PlaceSuggestion) => {
    onChange(s.placeName);
    onPick?.(s);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="space-y-1.5" ref={wrapperRef}>
      <Label htmlFor="bizName" required={required}>
        상호명
      </Label>
      <div className="relative">
        <Input
          id="bizName"
          name="bizName"
          value={value}
          autoComplete="off"
          required={required}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="상호명 입력 — 카카오에 등록된 매장이면 자동 매칭"
        />

        {open &&
          (suggestions.length > 0 ||
            loading ||
            (value.trim().length >= 2 && !loading)) && (
            <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-border bg-background shadow-lg">
              {loading && (
                <div className="px-3 py-2.5 text-xs text-muted-foreground">
                  검색 중…
                </div>
              )}
              {!loading &&
                suggestions.map((s, i) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => pick(s)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={
                      "block w-full text-left px-3 py-2.5 border-b border-border last:border-0 " +
                      (i === activeIdx ? "bg-muted" : "hover:bg-muted")
                    }
                  >
                    <div className="text-sm font-medium truncate">
                      {s.placeName}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground truncate">
                      {s.category ? `${s.category} · ` : ""}
                      {s.address}
                    </div>
                  </button>
                ))}
              {!loading && suggestions.length === 0 && value.trim().length >= 2 && (
                <div className="px-3 py-3 text-xs text-muted-foreground">
                  검색 결과가 없습니다. 그대로 입력하시고 주소·업종은
                  아래에서 직접 입력해주세요.
                </div>
              )}
            </div>
          )}
      </div>
      <p className="text-xs text-muted-foreground">
        매장이 카카오맵에 등록되어 있으면 클릭 한 번으로 주소·업종이 자동
        채워집니다.
      </p>
    </div>
  );
}
