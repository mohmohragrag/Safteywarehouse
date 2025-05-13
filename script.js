document.getElementById("frameForm").addEventListener("submit", function (e) {
  e.preventDefault();

  function get(id) {
    return parseFloat(document.getElementById(id).value);
  }

  const bf_r = get("bf_r"), tf_r = get("tf_r"), tw_r = get("tw_r"), hw_r = get("hw_r");
  const bf_c = get("bf_c"), tf_c = get("tf_c"), tw_c = get("tw_c"), hw_c = get("hw_c");
  const H = get("H"), H_total = get("H_total"), span = get("span"), spacing = get("spacing");
  const load_area = get("load_area"), fy = get("fy"), E = get("E"), FS = get("FS"), K = get("K");

  const rise = H_total - H;
  const Lr = Math.sqrt((span / 2) ** 2 + rise ** 2) * 1000;

  const w = load_area * spacing;
  const M = (w * (Lr / 1000) ** 2) / 8;

  function calc_I(bf, tf, tw, hw) {
    const h_total = hw + 2 * tf;
    const d = (h_total / 2) - (tf / 2);
    const I_flange = 2 * ((bf * tf ** 3) / 12 + (bf * tf) * d ** 2);
    const I_web = (tw * hw ** 3) / 12;
    return I_flange + I_web;
  }

  const I_r = calc_I(bf_r, tf_r, tw_r, hw_r);
  const I_c = calc_I(bf_c, tf_c, tw_c, hw_c);

  const y_r = (hw_r + 2 * tf_r) / 2;
  const sigma_r = (M * 1e6 * y_r) / I_r;
  const sigma_allow = fy / FS;

  const delta = (5 * w * (Lr ** 4)) / (384 * E * 1e3 * I_r);
  const delta_allow = Lr / 250;

  const P = w * (Lr / 1000) / 2 * 1e3;
  const L_col = H * 1000;
  const P_cr = (Math.PI ** 2 * E * 1e3 * I_c) / ((K * L_col) ** 2);
  const P_allow = P_cr / FS;

  const safe_sigma = sigma_r <= sigma_allow;
  const safe_delta = delta <= delta_allow;
  const safe_P = P <= P_allow;

  const results = {
    "Lr (مم)": Lr.toFixed(2),
    "العزم M (kNm)": M.toFixed(2),
    "إجهاد الرافتـر σ (MPa)": sigma_r.toFixed(2),
    "الإجهاد المسموح (MPa)": sigma_allow.toFixed(2),
    "الانحراف δ (مم)": delta.toFixed(3),
    "الانحراف المسموح (مم)": delta_allow.toFixed(2),
    "قوة العمود (N)": P.toFixed(2),
    "قوة الانبعاج المسموحة (N)": P_allow.toFixed(2),
    "I الرافتـر (مم^4)": I_r.toFixed(2),
    "I العمود (مم^4)": I_c.toFixed(2),
    "الحالة في الإجهاد": safe_sigma ? "آمن في الإجهاد" : "غير آمن في الإجهاد",
    "الحالة في الانحراف": safe_delta ? "آمن في الانحراف" : "غير آمن في الانحراف",
    "الحالة في الانبعاج": safe_P ? "آمن ضد الانبعاج" : "غير آمن ضد الانبعاج"
  };

  const is_safe = safe_sigma && safe_delta && safe_P;
  const resultDiv = document.getElementById('results');
  resultDiv.innerHTML = `<h3>النتائج:</h3>`;

  Object.entries(results).forEach(([k, v]) => {
    resultDiv.innerHTML += `<p><strong>${k}:</strong> ${v}</p>`;
  });

  if (is_safe) {
    resultDiv.innerHTML += `<h2 style="color: green;">الإطار آمن</h2>`;
  } else {
    resultDiv.innerHTML += `<h2 style="color: red;">الإطار غير آمن</h2>`;
    let reasons = [];
    if (!safe_sigma) reasons.push("الإجهاد تجاوز الحد المسموح");
    if (!safe_delta) reasons.push("الانحراف أكبر من المسموح");
    if (!safe_P) reasons.push("قوة الانبعاج أقل من المطلوبة");
    resultDiv.innerHTML += `<p><strong>الأسباب:</strong> ${reasons.join(" - ")}</p>`;
  }
});
