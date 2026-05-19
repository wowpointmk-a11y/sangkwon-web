import { brand } from "@/lib/brand";

export const metadata = {
  title: `이용약관 — ${brand.serviceTitle}`,
};

const REVISION_DATE = "2026-05-19";

export default function TermsPage() {
  return (
    <>
      <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        ✱ {brand.name}
      </div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">이용약관</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        최종 개정일: {REVISION_DATE}
      </p>

      <Section title="제1조 (목적)">
        <p>
          본 약관은 {brand.company.name}(이하 &ldquo;회사&rdquo;)이 제공하는
          상권분석 웹 서비스(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 회사와
          이용자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </Section>

      <Section title="제2조 (정의)">
        <ul>
          <li>
            &ldquo;서비스&rdquo;: 회사가 제공하는 공공데이터·AI 기반 상권분석
            리포트 및 부수 서비스 전반.
          </li>
          <li>
            &ldquo;이용자&rdquo;: 본 약관에 따라 회사가 제공하는 서비스를
            이용하는 자.
          </li>
          <li>
            &ldquo;콘텐츠&rdquo;: 서비스에서 제공되는 분석 리포트, AI 인사이트,
            키워드·플랫폼 추천 등 모든 산출물.
          </li>
        </ul>
      </Section>

      <Section title="제3조 (약관의 효력 및 변경)">
        <ul>
          <li>본 약관은 서비스 페이지에 게시함으로써 효력이 발생합니다.</li>
          <li>
            회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수
            있으며, 변경 시 변경 사유와 적용일을 7일 전부터 공지합니다.
          </li>
        </ul>
      </Section>

      <Section title="제4조 (서비스의 제공)">
        <ul>
          <li>
            서비스의 주요 기능: 매장 정보 입력 기반 상권분석 리포트 생성, AI
            인사이트·키워드·플랫폼 추천, 마케팅 컨설팅 상담 신청.
          </li>
          <li>
            서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검·고장·
            천재지변·통신두절 등 부득이한 사유로 일시 중단될 수 있습니다.
          </li>
        </ul>
      </Section>

      <Section title="제5조 (서비스 이용 신청 및 정보 입력)">
        <ul>
          <li>
            이용자는 분석 요청 시 정확한 정보를 입력하여야 하며, 허위 또는
            타인의 정보를 입력함으로써 발생한 문제에 대한 책임은 이용자에게
            있습니다.
          </li>
          <li>
            이용자는 본 서비스를 통해 수집되는 정보의 활용 범위에 대해
            개인정보 처리방침에 따라 동의합니다.
          </li>
        </ul>
      </Section>

      <Section title="제6조 (이용자의 의무)">
        <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
        <ul>
          <li>타인의 정보를 도용하거나 허위 사실을 등록하는 행위</li>
          <li>회사의 서비스에 부정한 방식으로 접근·이용하는 행위</li>
          <li>
            서비스에서 얻은 콘텐츠를 회사의 사전 동의 없이 영리 목적으로
            복제·전송·재배포하는 행위
          </li>
          <li>법령 또는 공서양속에 반하는 행위</li>
        </ul>
      </Section>

      <Section title="제7조 (콘텐츠의 저작권)">
        <ul>
          <li>
            서비스가 제공하는 분석 리포트·AI 인사이트의 저작권은 회사에
            귀속됩니다.
          </li>
          <li>
            이용자는 분석 결과를 본인 매장 운영·마케팅 의사결정 목적으로 자유롭게
            활용할 수 있으나, 무단 상업적 재배포는 금지됩니다.
          </li>
        </ul>
      </Section>

      <Section title="제8조 (책임 제한)">
        <ul>
          <li>
            회사가 제공하는 분석 리포트는 공공데이터 및 AI 모델 출력 기반의
            <b> 참고용 정보</b>입니다. 이용자의 사업 의사결정·결과에 대한 최종
            책임은 이용자에게 있으며, 회사는 분석 결과로 인한 직접·간접 손해에
            대해 책임지지 않습니다.
          </li>
          <li>
            공공데이터 API의 일시적 장애·지연·데이터 누락 등으로 인한 분석
            결과의 불완전성에 대해 회사는 별도 보상 의무를 지지 않습니다.
          </li>
          <li>
            회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지, 해킹 등 불가
            항력적 사유로 인한 손해에 대해 책임을 지지 않습니다.
          </li>
        </ul>
      </Section>

      <Section title="제9조 (마케팅 상담 안내)">
        <p>
          이용자가 분석 리포트 하단 &ldquo;마케팅 문의하기&rdquo; 폼을 통해
          연락처를 제출한 경우, 회사 또는 그 마케팅 담당자는 영업일 기준
          24시간 이내에 컨설팅 안내를 위해 연락드릴 수 있습니다.
        </p>
      </Section>

      <Section title="제10조 (분쟁 해결 및 관할)">
        <ul>
          <li>
            서비스 이용으로 발생한 분쟁에 대해서는 회사와 이용자가 상호 협의하여
            해결하며, 합의되지 않을 경우 회사 소재지를 관할하는 법원을
            전속관할로 합니다.
          </li>
          <li>본 약관에 명시되지 않은 사항은 관계 법령에 따릅니다.</li>
        </ul>
      </Section>

      <Section title="부칙">
        <p>본 약관은 {REVISION_DATE}부터 시행합니다.</p>
      </Section>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="not-prose mt-10">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-foreground/80 [&_a]:underline [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_b]:font-semibold">
        {children}
      </div>
    </section>
  );
}
