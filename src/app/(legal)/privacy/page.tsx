import { brand } from "@/lib/brand";

export const metadata = {
  title: `개인정보 처리방침 — ${brand.serviceTitle}`,
};

const REVISION_DATE = "2026-05-19";

export default function PrivacyPage() {
  return (
    <>
      <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        ✱ {brand.name}
      </div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        개인정보 처리방침
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        최종 개정일: {REVISION_DATE}
      </p>

      <Section title="1. 총칙">
        <p>
          {brand.company.name}(이하 &ldquo;회사&rdquo;)은(는) 정보주체의 자유와 권리
          보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수합니다.
          본 방침은 상권분석 서비스(이하 &ldquo;서비스&rdquo;) 이용 과정에서
          수집·이용·보관·파기되는 개인정보에 적용됩니다.
        </p>
      </Section>

      <Section title="2. 수집하는 개인정보 항목 및 수집 방법">
        <p>회사는 다음의 정보를 수집합니다.</p>
        <h3>가. 필수 정보</h3>
        <ul>
          <li>매장 정보: 상호명, 업종, 주소</li>
          <li>문의자 정보: 이름, 연락처(전화번호)</li>
        </ul>
        <h3>나. 선택 정보</h3>
        <ul>
          <li>사업자등록번호 (입력 시 국세청 진위확인 수행)</li>
          <li>이메일 주소, 대표 메뉴, 문의 메모</li>
        </ul>
        <h3>다. 자동 수집 정보</h3>
        <ul>
          <li>접속 로그, 쿠키, 접속 IP, 기기/브라우저 정보</li>
        </ul>
        <h3>라. 수집 방법</h3>
        <ul>
          <li>서비스 이용 중 정보주체가 직접 입력</li>
          <li>로그 분석 도구를 통한 자동 수집</li>
        </ul>
      </Section>

      <Section title="3. 개인정보의 이용 목적">
        <ul>
          <li>
            상권분석 리포트 생성·제공 (공공데이터 API 호출, AI 인사이트 생성)
          </li>
          <li>마케팅 컨설팅 상담 및 영업 안내</li>
          <li>서비스 품질 개선 및 통계 분석</li>
          <li>법령상 의무 이행 (분쟁 조정, 민원 처리 등)</li>
        </ul>
      </Section>

      <Section title="4. 보유 및 이용 기간">
        <ul>
          <li>
            <b>문의자 정보(이름, 연락처, 이메일, 메모):</b> 수집일로부터{" "}
            <b>3년</b> 보관 후 즉시 파기. 단, 정보주체가 동의 철회를 요청하면
            지체 없이 파기합니다.
          </li>
          <li>
            <b>분석 매장 정보(상호, 업종, 주소, 좌표, 분석 결과):</b> 통계
            가공 및 서비스 품질 개선 목적으로 비식별화 후 보관.
          </li>
          <li>
            <b>접속 로그·쿠키:</b> 90일 이내 파기.
          </li>
          <li>
            법령에 따라 보관이 요구되는 경우(전자상거래법 등) 해당 기간 동안
            보관 후 파기합니다.
          </li>
        </ul>
      </Section>

      <Section title="5. 개인정보의 제3자 제공">
        <p>
          회사는 정보주체의 별도 동의 없이 개인정보를 제3자에게 제공하지
          않습니다.
        </p>
      </Section>

      <Section title="6. 개인정보 처리의 위탁">
        <p>
          서비스 제공을 위해 다음과 같이 개인정보 처리를 외부에 위탁합니다.
        </p>
        <table>
          <thead>
            <tr>
              <th>수탁자</th>
              <th>위탁 업무</th>
              <th>위치</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Supabase, Inc.</td>
              <td>데이터베이스·인증 호스팅</td>
              <td>대한민국 (Seoul Region)</td>
            </tr>
            <tr>
              <td>Vercel, Inc.</td>
              <td>웹 호스팅 / 배포 인프라</td>
              <td>글로벌 CDN</td>
            </tr>
            <tr>
              <td>OpenAI, OpC</td>
              <td>AI 인사이트 생성 (입력 데이터는 학습에 사용되지 않음)</td>
              <td>미국</td>
            </tr>
            <tr>
              <td>(주)카카오</td>
              <td>주소·좌표 변환, 매장 검색</td>
              <td>대한민국</td>
            </tr>
            <tr>
              <td>공공데이터포털</td>
              <td>상가/인구/사업자 정보 조회</td>
              <td>대한민국</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="7. 정보주체의 권리·의무 및 행사 방법">
        <p>정보주체는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
        <ul>
          <li>개인정보 열람 요구</li>
          <li>오류가 있을 경우 정정·삭제 요구</li>
          <li>처리정지 요구</li>
        </ul>
        <p>
          행사 방법: 본 페이지 하단 연락처로 서면, 전화, 이메일을 통해
          요청하시면 회사는 지체 없이 조치합니다.
        </p>
      </Section>

      <Section title="8. 개인정보의 파기 절차 및 방법">
        <ul>
          <li>
            <b>파기 절차:</b> 보유 기간 만료 또는 처리 목적 달성 시 내부 방침
            및 관련 법령에 따라 파기합니다.
          </li>
          <li>
            <b>파기 방법:</b> 전자 파일은 복구·재생할 수 없는 방법으로 영구
            삭제, 종이 문서는 분쇄 또는 소각합니다.
          </li>
        </ul>
      </Section>

      <Section title="9. 개인정보의 안전성 확보 조치">
        <ul>
          <li>관리적 조치: 내부관리계획 수립, 정기 점검</li>
          <li>
            기술적 조치: 접근 권한 관리, 암호화(TLS/HTTPS), 보안 프로그램 설치
          </li>
          <li>물리적 조치: 데이터 저장 장소 접근 통제</li>
        </ul>
      </Section>

      <Section title="10. 쿠키(Cookie)의 운영">
        <p>
          회사는 서비스 제공을 위해 쿠키를 사용할 수 있습니다. 정보주체는
          브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용에
          제한이 있을 수 있습니다.
        </p>
      </Section>

      <Section title="11. 개인정보 보호책임자">
        <ul>
          <li>책임자: {brand.company.privacyOfficer}</li>
          <li>
            연락처:{" "}
            <a href={`tel:${brand.company.phone.replace(/-/g, "")}`}>
              {brand.company.phone}
            </a>{" "}
            /{" "}
            <a href={`mailto:${brand.company.email}`}>{brand.company.email}</a>
          </li>
        </ul>
        <p>
          또는 개인정보보호위원회·개인정보침해신고센터 등 외부 기관에 신고가
          가능합니다.
        </p>
      </Section>

      <Section title="12. 본 방침의 변경">
        <p>
          본 방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의
          추가·삭제·정정이 있는 경우 시행일로부터 7일 전 본 페이지를 통해
          공지합니다.
        </p>
      </Section>

      <Section title="13. 회사 정보">
        <ul>
          <li>상호: {brand.company.name}</li>
          <li>대표자: {brand.company.representative}</li>
          <li>사업자등록번호: {brand.company.bizRegNo}</li>
          <li>주소: {brand.company.address}</li>
          <li>
            연락처:{" "}
            <a href={`tel:${brand.company.phone.replace(/-/g, "")}`}>
              {brand.company.phone}
            </a>
          </li>
          <li>
            이메일:{" "}
            <a href={`mailto:${brand.company.email}`}>{brand.company.email}</a>
          </li>
        </ul>
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
      <div className="mt-3 text-sm leading-relaxed text-foreground/80 [&_a]:underline [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_table]:mt-3 [&_table]:w-full [&_table]:text-xs [&_th]:text-left [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1.5 [&_td]:border-t [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5 [&_td]:align-top">
        {children}
      </div>
    </section>
  );
}
