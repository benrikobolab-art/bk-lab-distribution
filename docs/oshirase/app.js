import { TEMPLATES, GREETINGS, seasonForMonth, clamp, effectiveIntroFont, proofread } from "./core.mjs";

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "oshirase-auto-web-history-v1";
const state = { template: "イベント案内", values: {}, introTop: 23, introFont: 15, detailsTop: 52 };

const templateSelect = $("template");
for (const name of Object.keys(TEMPLATES)) templateSelect.add(new Option(name, name));
$("season").value = seasonForMonth(new Date().getMonth() + 1);

function fields() { return TEMPLATES[state.template][1]; }

function resetForm() {
  state.values = { title: TEMPLATES[state.template][0], intro: "" };
  for (const field of fields()) state.values[field] = "";
  state.introTop = 23; state.introFont = 15; state.detailsTop = 52;
  buildFields(); syncControls(); render();
}

function buildFields() {
  $("titleInput").value = state.values.title || "";
  $("introInput").value = state.values.intro || "";
  const container = $("dynamicFields");
  container.replaceChildren();
  for (const field of fields()) {
    const wrapper = document.createElement("div"); wrapper.className = "field";
    const label = document.createElement("label"); label.htmlFor = `field-${field}`; label.textContent = field;
    const multiline = ["本文", "注意事項", "お願い", "内容", "工事内容"].includes(field);
    const input = document.createElement(multiline ? "textarea" : "input");
    input.id = `field-${field}`; input.dataset.field = field; input.value = state.values[field] || "";
    if (multiline) input.rows = 2; else input.type = "text";
    input.addEventListener("input", () => { state.values[field] = input.value; render(); });
    wrapper.append(label, input); container.append(wrapper);
  }
}

function syncControls() {
  templateSelect.value = state.template;
  $("introTop").value = state.introTop; $("introFont").value = state.introFont; $("detailsTop").value = state.detailsTop;
}

function render() {
  $("previewTitle").textContent = state.values.title || "お知らせ";
  const intro = state.values.intro || "";
  $("previewIntro").textContent = intro;
  $("previewIntro").style.top = `${clamp(state.introTop, 18, 40, 23)}%`;
  $("previewIntro").style.fontSize = `${effectiveIntroFont(intro, state.introFont)}pt`;
  $("previewDetails").style.top = `${clamp(state.detailsTop, 43, 60, 52)}%`;
  $("introFontValue").textContent = `${state.introFont}pt`;
  $("introTopValue").textContent = `${state.introTop}%`;
  $("detailsTopValue").textContent = `${state.detailsTop}%`;
  const details = $("previewDetails"); details.replaceChildren();
  for (const field of fields()) {
    const value = (state.values[field] || "").trim(); if (!value) continue;
    const row = document.createElement("div"); row.className = "preview-row";
    const label = document.createElement("strong"); label.textContent = field;
    const text = document.createElement("span"); text.textContent = value;
    row.append(label, text); details.append(row);
  }
  $("previewFooter").textContent = `発行日：${new Intl.DateTimeFormat("ja-JP", {dateStyle: "long"}).format(new Date())}`;
  $("status").textContent = "プレビュー更新済み";
}

function snapshot() { return { template: state.template, values: {...state.values}, introTop: state.introTop, introFont: state.introFont, detailsTop: state.detailsTop, savedAt: new Date().toISOString() }; }
function history() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }
function save() { const items = history(); items.unshift(snapshot()); localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30))); $("status").textContent = "ブラウザに保存しました"; }

function showHistory() {
  const list = $("historyList"); list.replaceChildren(); const items = history();
  if (!items.length) { const p = document.createElement("p"); p.textContent = "保存されたデータはありません。"; list.append(p); }
  items.forEach((item, index) => {
    const button = document.createElement("button"); button.type = "button"; button.className = "history-item";
    button.textContent = `${new Date(item.savedAt).toLocaleString("ja-JP")}　${item.template}　${item.values?.title || ""}`;
    button.addEventListener("click", () => { Object.assign(state, item); buildFields(); syncControls(); render(); $("historyDialog").close(); });
    list.append(button);
  });
  $("historyDialog").showModal();
}

templateSelect.addEventListener("change", () => { state.template = templateSelect.value; resetForm(); });
$("titleInput").addEventListener("input", (event) => { state.values.title = event.target.value; render(); });
$("introInput").addEventListener("input", (event) => { state.values.intro = event.target.value; render(); });
for (const id of ["introTop", "introFont", "detailsTop"]) $(id).addEventListener("input", (event) => { state[id] = Number(event.target.value); render(); });
$("greetingButton").addEventListener("click", () => { state.values.intro = GREETINGS[$("season").value]; $("introInput").value = state.values.intro; render(); });
$("newButton").addEventListener("click", resetForm);
$("saveButton").addEventListener("click", save);
$("historyButton").addEventListener("click", showHistory);
$("proofreadButton").addEventListener("click", () => { const list = $("proofreadList"); list.replaceChildren(); for (const message of proofread(state.values)) { const li = document.createElement("li"); li.textContent = message; list.append(li); } $("proofreadDialog").showModal(); });
$("printButton").addEventListener("click", () => { save(); window.print(); });

resetForm();

