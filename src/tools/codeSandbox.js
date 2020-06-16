import $ from 'jquery';

let sandboxContainer, compileBtn, templates, html, css, js, code;
let isCodeSandboxOpen = false;

const sandboxTemplate = `
    <textarea id="sandbox_html" class="codeLanguageBlock" placeholder="HTML"></textarea>
    <textarea id="sandbox_css" class="codeLanguageBlock" placeholder="CSS"></textarea>
    <textarea id="sandbox_js" class="codeLanguageBlock" placeholder="JavaScript"></textarea>
    <iframe id="sandbox_code" class="codeContent"></iframe>
`;

export function getCodeSandboxOpenState() {
  return isCodeSandboxOpen;
}

export function toggleCodeSandbox() {
  isCodeSandboxOpen = !isCodeSandboxOpen;

  if (isCodeSandboxOpen) {
    openSandbox();
  } else {
    closeSandbox();
  }
}

function openSandbox() {
  sandboxContainer = $('<div class="sandboxContainer">').appendTo($('body'));
  const closeBtn = $('<div class="closeBtn">').text('X').appendTo(sandboxContainer);
  compileBtn = $('<div class="runBtn extBtn">').text('Run').appendTo(sandboxContainer);
  templates = $('<div class="sandboxTemplates">').appendTo(sandboxContainer).html(sandboxTemplate);

  html = document.getElementById('sandbox_html');
  css = document.getElementById('sandbox_css');
  js = document.getElementById('sandbox_js');
  code = document.getElementById('sandbox_code').contentWindow.document;

  closeBtn.click(() => {
    toggleCodeSandbox();
  });

  compileBtn.click(() => {
    compile();
  });

  compile();
}

function closeSandbox() {
  if (sandboxContainer) {
    sandboxContainer.remove();
    sandboxContainer = null;
  }
}

function compile() {
  code.open();
  code.writeln(
    html.value +
    '<style>' +
    css.value +
    '</style>' +
    '<script>' +
    js.value +
    '</script>'
  );
  code.close();
}
