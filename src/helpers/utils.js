import $ from 'jquery'

export function setI18nText() {
  $('[data-i18n]').each(function() {
    const key = $(this).data('i18n');
    const text = brApi.i18n.getMessage(key);
    if ($(this).is('input')) {
      $(this).val(text);
    } else {
      $(this).text(text);
    }
  })
}
