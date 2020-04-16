(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['atmosphere.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"card card--atmosphere\">\r\n  <div class=\"card__header\">\r\n    <div class=\"card__header__icon\">\r\n    </div>\r\n    <span class=\"card__header__title\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data,"loc":{"start":{"line":6,"column":38},"end":{"line":6,"column":46}}}) : helper)))
    + "</span>\r\n    <div class=\"btn btn--reorder btn--reorder-up btn--square\">\r\n      <div class=\"btn__inner\">\r\n        <i class=\"fa fa-arrow-up\" aria-hidden=\"true\"></i>\r\n      </div>\r\n    </div>\r\n    <div class=\"btn btn--reorder btn--reorder-down btn--square\">\r\n      <div class=\"btn__inner\">\r\n        <i class=\"fa fa-arrow-down\" aria-hidden=\"true\"></i>\r\n      </div>\r\n    </div>\r\n    <div class=\"btn btn--square btn--drag\">\r\n      <div class=\"btn__inner\">\r\n        <i class=\"fa fa-times\" aria-hidden=\"true\"></i>\r\n      </div>\r\n    </div>\r\n    <div class=\"btn btn--square btn--delete\">\r\n      <div class=\"btn__inner\">\r\n        <i class=\"fa fa-times\" aria-hidden=\"true\"></i>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"card__body\">\r\n    <div class=\"card__body__atmosphere-controls\">\r\n      <div class=\"btn\">\r\n        <div class=\"btn__inner\">\r\n          Transition To\r\n        </div>\r\n      </div>\r\n      <div class=\"btn btn--half\">\r\n        <div class=\"btn__inner\">\r\n          Layer On Top\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n\r\n";
},"useData":true});
})();