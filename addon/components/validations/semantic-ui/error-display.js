import Component from '@ember/component';
import layout from '../../../templates/components/validations/semantic-ui/error-display';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  tagName         : '',
  listView        : true,
  identifierClass : 'validation-error'
});
