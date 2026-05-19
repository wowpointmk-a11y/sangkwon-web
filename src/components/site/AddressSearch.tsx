"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

// Daum 우편번호 서비스 (카카오 자회사 무료 SDK)
// https://postcode.map.daum.net/guide

interface DaumPostcodeData {
  address: string; // 기본 주소 (지번)
  roadAddress: string; // 도로명 주소
  jibunAddress: string;
  zonecode: string;
  sido: string;
  sigungu: string;
  buildingName: string;
}

interface DaumPostcode {
  open: () => void;
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
        onclose?: () => void;
        width?: string;
        height?: string;
      }) => DaumPostcode;
    };
  }
}

const POSTCODE_SCRIPT =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

let scriptLoaded = false;

function loadScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (typeof window === "undefined") return Promise.reject();

  return new Promise((resolve, reject) => {
    if (window.daum?.Postcode) {
      scriptLoaded = true;
      return resolve();
    }
    const s = document.createElement("script");
    s.src = POSTCODE_SCRIPT;
    s.async = true;
    s.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    s.onerror = () => reject(new Error("주소 검색 스크립트 로드 실패"));
    document.head.appendChild(s);
  });
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
}

export function AddressSearch({
  value,
  onChange,
  name = "address",
  required,
  placeholder = "주소를 검색하세요",
}: Props) {
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // 페이지 진입 시 미리 스크립트 프리페치
    loadScript().catch(() => {});
  }, []);

  const open = async () => {
    setLoading(true);
    try {
      await loadScript();
      if (!window.daum?.Postcode) throw new Error("postcode unavailable");

      new window.daum.Postcode({
        oncomplete: (data) => {
          const picked = data.roadAddress || data.jibunAddress || data.address;
          const withBuilding = data.buildingName
            ? `${picked} (${data.buildingName})`
            : picked;
          onChange(withBuilding);
        },
      }).open();
    } catch (e) {
      console.error(e);
      alert("주소 검색 창을 열지 못했습니다. 직접 입력해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        readOnly
        onClick={open}
        className="h-11 flex-1 cursor-pointer rounded-md border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        onClick={open}
        disabled={loading}
        className="shrink-0"
      >
        {loading ? "..." : "주소 검색"}
      </Button>
    </div>
  );
}
