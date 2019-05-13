import Component from '@ember/component';
import layout from '../../../templates/components/validations/semantic-ui/error-display';

export default Component.extend({
  layout,
  tagName         : '',
  listView        : true,
  identifierClass : 'validation-error'
});
