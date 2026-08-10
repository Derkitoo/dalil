"use client";

import { useState } from "react";

const demoClaim = "شرب الماء الساخن جدًا يقضي على الفيروسات. انشرها ليستفيد الجميع!";

export default function Home() {
  const [claim, setClaim] = useState("");
  const [step, setStep] = useState<"idle" | "loading" | "result">("idle");
  const [answer, setAnswer] = useState<string | null>(null);

  function investigate() {
    if (!claim.trim()) return;
    setStep("loading");
    setAnswer(null);
    window.setTimeout(() => setStep("result"), 900);
  }

  function reset() {
    setClaim("");
    setStep("idle");
    setAnswer(null);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="دليل — الصفحة الرئيسية">
          <span className="brandMark">د</span>
          <span>دليل</span>
        </a>
        <nav aria-label="التنقل الرئيسي">
          <a href="#method">كيف يعمل؟</a>
          <button className="language" type="button">FR</button>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span /> فكّر قبل أن تنشر</div>
        <h1>لا تصدّقني.<br /><em>تعلّم كيف تتحقّق.</em></h1>
        <p className="intro">أرسل لنا خبرًا، رسالة أو ادّعاءً. سنفكّكه معك، نبحث عن الدليل، ونريك كيف تصل إلى الحقيقة بنفسك.</p>

        <div className="investigator">
          <label htmlFor="claim">ما المعلومة التي تريد التحقّق منها؟</label>
          <textarea
            id="claim"
            value={claim}
            onChange={(event) => setClaim(event.target.value)}
            placeholder="الصق رسالة، ادّعاءً، أو رابطًا هنا…"
            rows={4}
          />
          <div className="actions">
            <button className="primary" type="button" onClick={investigate} disabled={!claim.trim() || step === "loading"}>
              {step === "loading" ? "نبحث عن الأدلة…" : "ابدأ التحقيق"}<span>←</span>
            </button>
            <button className="sample" type="button" onClick={() => { setClaim(demoClaim); setStep("idle"); }}>
              جرّب مثالًا
            </button>
          </div>
          <div className="privacy"><span>◆</span> ما ترسله يبقى خاصًا ولا يُستخدم للإعلانات</div>
        </div>
      </section>

      {step === "loading" && (
        <section className="loadingCard" aria-live="polite">
          <div className="loader" />
          <div><strong>نبني خريطة الادّعاء</strong><p>نحدّد ما يمكن التحقّق منه ونختار المصادر المناسبة…</p></div>
        </section>
      )}

      {step === "result" && (
        <section className="result" aria-live="polite">
          <div className="resultHead">
            <div><span className="label">نتيجة التحقيق التجريبي</span><h2>الادّعاء غير مدعوم</h2></div>
            <div className="confidence"><strong>عالية</strong><span>درجة الثقة</span></div>
          </div>

          <div className="verdict">
            <span className="verdictIcon">!</span>
            <p>لا يوجد دليل موثوق يثبت أن شرب الماء الساخن يمنع العدوى الفيروسية أو يعالجها. الرسالة تحوّل حقيقة مخبرية محدودة إلى نصيحة طبية غير مثبتة.</p>
          </div>

          <div className="evidenceGrid">
            <article><span>01</span><h3>ما نعرفه</h3><p>يمكن للحرارة تعطيل بعض الفيروسات في ظروف مخبرية دقيقة.</p></article>
            <article><span>02</span><h3>أين التضليل؟</h3><p>لا يعني ذلك أن شرب سائل ساخن يرفع حرارة الجسم أو يعالج العدوى.</p></article>
            <article><span>03</span><h3>ما الذي ينقص؟</h3><p>دراسة سريرية تثبت أثر هذا السلوك على الوقاية أو العلاج.</p></article>
          </div>

          <div className="sources">
            <div><span className="sourceIcon">↗</span><p><strong>المصادر في المنتج الحقيقي</strong><br />روابط مباشرة، تاريخ النشر، نوع الدليل، ومقارنة بين مصادر مستقلة.</p></div>
            <span className="prototype">نموذج توضيحي — غير متصل بمصادر حية</span>
          </div>

          <div className="lesson">
            <div className="lessonNumber">١</div>
            <div className="lessonBody">
              <span className="label">تعلّم في 20 ثانية</span>
              <h3>أي علامة يجب أن تثير حذرك؟</h3>
              <div className="choices">
                {["الرسالة تطلب النشر فورًا", "الرسالة تتحدث عن الماء", "الرسالة مكتوبة بالعربية"].map((choice, index) => (
                  <button className={answer === choice ? (index === 0 ? "correct" : "wrong") : ""} key={choice} onClick={() => setAnswer(choice)}>{choice}</button>
                ))}
              </div>
              {answer && <p className="feedback">{answer === "الرسالة تطلب النشر فورًا" ? "أحسنت. الاستعجال يمنعنا من التحقق ويزيد انتشار الإشاعة." : "حاول مجددًا: ابحث عن الأسلوب الذي يدفعك للتصرف قبل التفكير."}</p>}
            </div>
          </div>

          <button className="reset" onClick={reset}>تحقّق من معلومة أخرى ←</button>
        </section>
      )}

      <section className="method" id="method">
        <div><span className="sectionNo">01</span><h2>من الرسالة<br />إلى الدليل</h2></div>
        <ol>
          <li><span>١</span><div><h3>نُفكّك الادّعاء</h3><p>نفصل الحقائق عن الآراء والمبالغات.</p></div></li>
          <li><span>٢</span><div><h3>نعود إلى المصدر</h3><p>نبحث في الوثائق الأصلية والمراجع الموثوقة.</p></div></li>
          <li><span>٣</span><div><h3>نشرح بلا غموض</h3><p>نعرض ما نعرفه، وما لا نعرفه، ولماذا.</p></div></li>
        </ol>
      </section>

      <footer><div className="brand"><span className="brandMark">د</span><span>دليل</span></div><p>الحقيقة ليست جوابًا سريعًا. إنها طريقة تفكير.</p><span>نسخة تجريبية 0.1</span></footer>
    </main>
  );
}
