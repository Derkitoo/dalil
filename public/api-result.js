// api-result.js — Dynamic verdict updater driven by VirusTotal / typosquatting API data
// Called by checkLive() after each API response and by translate() on language switch.

function applyApiResult(data) {
  var isFr = (typeof lang !== 'undefined') ? lang === 'fr' : true;
  var d = data.domain || (isFr ? 'ce domaine' : 'هذا النطاق');
  var title = '', verdict = '', badge = '', label = '';

  if (data.status === 'malicious') {
    var n = (data.stats && data.stats.malicious) || '?';
    title  = isFr ? '🚨 Lien malveillant confirmé' : '🚨 رابط ضار مؤكد';
    verdict = isFr
      ? 'VirusTotal signale le domaine « ' + d + ' » comme malveillant (' + n + ' moteur(s) de détection). N\'ouvrez pas ce lien et ne partagez aucune donnée personnelle.'
      : 'يُعلن VirusTotal أن النطاق « ' + d + ' » ضار (' + n + ' محرك). لا تفتح هذا الرابط ولا تشارك أي بيانات.';
    badge  = isFr ? '🔴<br>Danger' : '🔴<br>خطر';
    label  = '● VirusTotal Live';

  } else if (data.status === 'suspicious') {
    var n = (data.stats && data.stats.suspicious) || '?';
    title  = isFr ? '⚠️ Lien suspect' : '⚠️ رابط مشبوه';
    verdict = isFr
      ? '« ' + d + ' » est signalé suspect par ' + n + ' moteur(s) VirusTotal. Évitez de cliquer et vérifiez l\'expéditeur par une autre voie.'
      : '« ' + d + ' » مشبوه وفق ' + n + ' محرك(ات) VirusTotal. تجنّب الضغط عليه.';
    badge  = isFr ? '🟡<br>Suspect' : '🟡<br>مشبوه';
    label  = '● VirusTotal Live';

  } else if (data.typosquatting && data.typosquatting.suspected) {
    var t = data.typosquatting.targetOfficialDomain;
    title  = isFr ? '🚨 Usurpation d\'identité détectée' : '🚨 انتحال هوية مكتشف';
    verdict = isFr
      ? 'Le domaine « ' + d + ' » imite le site officiel « ' + t + ' ». Technique classique de phishing — n\'entrez aucun identifiant sur ce site.'
      : 'النطاق « ' + d + ' » يُقلّد الموقع الرسمي « ' + t + ' ». تقنية تصيّد — لا تُدخل أي بيانات على هذا الموقع.';
    badge  = isFr ? '🔴<br>Danger' : '🔴<br>خطر';
    label  = isFr ? '● Usurpation détectée' : '● انتحال مكتشف';

  } else if (data.status === 'no_detection') {
    title  = isFr ? '✅ Aucun signal d\'alerte' : '✅ لا إنذارات';
    verdict = isFr
      ? 'VirusTotal ne détecte rien de malveillant sur le domaine « ' + d + ' ». Restez vigilant : l\'absence de détection ne garantit pas la sécurité.'
      : 'لا يكشف VirusTotal شيئًا ضارًا على النطاق « ' + d + ' ». الغياب لا يضمن الأمان — ابقَ حذرًا.';
    badge  = isFr ? '🟢<br>Propre' : '🟢<br>نظيف';
    label  = '● VirusTotal Live';

  } else {
    // No data or unknown status — keep local analysis label
    label = isFr ? '● Analyse locale' : '● تحليل محلي';
    // Don't overwrite title/verdict/badge — keep the local analysis result visible
    document.querySelector('#resultLabel').textContent = label;
    return;
  }

  document.querySelector('#resultTitle').textContent = title;
  document.querySelector('#verdict').textContent = verdict;
  document.querySelector('#confidence').innerHTML = badge;
  document.querySelector('#resultLabel').textContent = label;
}
