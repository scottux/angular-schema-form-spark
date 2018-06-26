// ngtemplate-loader embeds the html on build
import actionsTemplate from './spark/actions.html';
import arrayTemplate from './spark/array.html';
import checkboxTemplate from './spark/checkbox.html';
import checkboxesTemplate from './spark/checkboxes.html';
import defaultTemplate from './spark/default.html';
import fieldsetTemplate from './spark/fieldset.html';
import helpTemplate from './spark/help.html';
//import radiobuttonsTemplate from './spark/radio-buttons.html';
import radiosTemplate from './spark/radios.html';
//import radiosInlineTemplate from './spark/radios-inline.html';
import sectionTemplate from './spark/section.html';
import selectTemplate from './spark/select.html';
import submitTemplate from './spark/submit.html';
import tabarrayTemplate from './spark/tabarray.html';
import tabsTemplate from './spark/tabs.html';
import textareaTemplate from './spark/textarea.html';

angular
  .module('schemaForm')
  .config(decoratorConfig);

decoratorConfig.$inject = [
  'schemaFormDecoratorsProvider', 'sfBuilderProvider'
];

/**
 *
 * @param decoratorsProvider
 * @param sfBuilderProvider
 */
function decoratorConfig(decoratorsProvider, sfBuilderProvider) {
    var simpvarransclusion  = sfBuilderProvider.builders.simpvarransclusion;
    var ngModelOptions      = sfBuilderProvider.builders.ngModelOptions;
    var ngModel             = sfBuilderProvider.builders.ngModel;
    var sfField             = sfBuilderProvider.builders.sfField;
    var condition           = sfBuilderProvider.builders.condition;
    var array               = sfBuilderProvider.builders.array;
    var numeric             = sfBuilderProvider.builders.numeric;
    var defaults = [sfField, ngModel, ngModelOptions, condition];

    decoratorsProvider.defineDecorator('sparkDecorator', {
        actions: {template: actionsTemplate, builder: defaults},
        array: {template: arrayTemplate, builder: [ sfField, ngModelOptions, ngModel, array, condition ]},
        button: {template: submitTemplate, builder: defaults},
        checkbox: {template: checkboxTemplate, builder: defaults},
        checkboxes: {template: checkboxesTemplate, builder: [ sfField, ngModelOptions, ngModel, array, condition ]},
        conditional: {template: sectionTemplate, builder: [ sfField, simpvarransclusion, condition ]},
        'default': {template: defaultTemplate, builder: defaults},
        fieldset: {template: fieldsetTemplate, builder: [ sfField, simpvarransclusion, condition ]},
        help: {template: helpTemplate, builder: defaults},
        number: {template: defaultTemplate, builder: defaults.concat(numeric)},
        password: {template: defaultTemplate, builder: defaults},
        radios: {template: radiosTemplate, builder: defaults},
        // 'radios-inline': {template: radiosInlineTemplate, builder: defaults},
        // radiobuttons: {template: radiobuttonsTemplate, builder: defaults},
        section: {template: sectionTemplate, builder: [ sfField, simpvarransclusion, condition ]},
        select: {template: selectTemplate, builder: [ selectPlaceholder ].concat(defaults)},
        submit: {template: submitTemplate, builder: defaults},
        tabarray: {template: tabarrayTemplate, builder: [ sfField, ngModelOptions, ngModel, array, condition ]},
        tabs: {template: tabsTemplate, builder: [ sfField, ngModelOptions, tabs, condition ]},
        textarea: {template: textareaTemplate, builder: defaults},
    }, []);

    // Tabs is so bootstrap specific that it stays here.
    // @todo wtf??
    function tabs(args) {
        if (args.form.tabs && args.form.tabs.length > 0) {
            var tabContent = args.fieldFrag.querySelector('.tab-content');

            args.form.tabs.forEach(function (tab, index) {
                var evalExpr = '(evalExpr(' + args.path + '.tabs[' + index + ']' +
                    '.condition, { model: model, "arrayIndex": $index}))';
                var div = document.createElement('div');
                div.className = 'tab-pane';
                div.setAttribute('ng-disabled', 'form.readonly');
                div.setAttribute('ng-show', 'selected.tab === ' + index);
                div.setAttribute('ng-class', '{active: selected.tab === ' + index + '}');

                if(!!tab.condition) {
                    div.setAttribute('ng-if', evalExpr);
                }

                var childFrag = args.build(tab.items, args.path + '.tabs[' + index + '].items', args.state);
                div.appendChild(childFrag);
                tabContent.appendChild(div);
            });
        }
    }

    function selectPlaceholder(args) {
        if (args.form.placeholder) {
            var selectBox = args.fieldFrag.querySelector('select');
            var option = document.createElement('option');
            option.setAttribute('value', '');

            /* We only want the placeholder to show when we do not have a value on the model.
             * We make ngModel builder replace all so we can use $$value$$.
             */
            option.setAttribute('sf-field-model', 'replaceAll');

            /* https://github.com/angular/angular.js/issues/12190#issuecomment-115277040
             * angular > 1.4 does a emptyOption.attr('selected', true)
             * which does not like the ng-if comment.
             */
            if (angular.version.major === 1 && angular.version.minor < 4) {
                option.setAttribute('ng-if', '$$value$$ === undefined');
            } else {
                option.setAttribute('ng-show', '$$value$$ === undefined');
            }

            option.textContent = args.form.placeholder;

            selectBox.appendChild(option);
        }
    }
}
