import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brand } from "@/lib/brand";

// 카톡·네이버 링크 미리보기 이미지. 빌드 때 한 번 생성된다.
// 폰트는 Pretendard 를 KS X 1001 한글 2350자 + ASCII 로 잘라 assets/fonts 에 둠.

export const alt = `${brand.serviceTitle} — ${brand.serviceTagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [extraBold, medium] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Pretendard-ExtraBold.subset.otf")),
    readFile(join(process.cwd(), "assets/fonts/Pretendard-Medium.subset.ttf")),
  ]);

  const [line1, line2] = brand.serviceTagline.split(", ");
  // new URL().hostname 은 퓨니코드로 바뀌어서 원문 문자열에서 뗀다
  const domain = brand.siteUrl.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="34" height="34" viewBox="0 0 34 34">
            <g stroke="#fafafa" strokeWidth="6" strokeLinecap="round">
              <line x1="17" y1="4" x2="17" y2="30" />
              <line x1="4" y1="17" x2="30" y2="17" />
              <line x1="7.8" y1="7.8" x2="26.2" y2="26.2" />
              <line x1="26.2" y1="7.8" x2="7.8" y2="26.2" />
            </g>
          </svg>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>
            WOW POINT.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 32, fontWeight: 500, color: "#a3a3a3" }}>
            무료 상권분석
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 20,
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: -2,
            }}
          >
            <div>{line2 ? `${line1},` : line1}</div>
            {line2 ? <div>{line2}</div> : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 28,
            fontWeight: 500,
            color: "#a3a3a3",
          }}
        >
          <div>인구 · 업종 · 경쟁 상권을 한 번에</div>
          <div style={{ color: "#fafafa" }}>{domain}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: extraBold, weight: 800, style: "normal" },
        { name: "Pretendard", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
