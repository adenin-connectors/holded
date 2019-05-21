'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);
    let response = await api(`/crm/v1/leads`);
    if ($.isErrorResponse(activity, response)) return;

    // we do not have good way to get all tasks
    const value = response.body.length;

    let pagination = $.pagination(activity);
    let pagiantedItems = api.paginateItems(response.body,pagination);

    activity.Response.Data.items = mapLeadsToItems(pagiantedItems);
    activity.Response.Data.title = T(activity, 'My Leads');
    activity.Response.Data.link = 'https://app.holded.com/crm/leads';
    activity.Response.Data.linkLabel = T(activity, 'All Leads');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} leads.", value)
        : T(activity, "You have 1 lead.");
    } else {
      activity.Response.Data.description = T(activity, `You have no leads.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
/**maps response data to items */
function mapLeadsToItems(issues) {
  const items = [];

  for (let i = 0; i < issues.length; i++) {
    const raw = issues[i];
    const item = {
      count: issues.length,
      id: raw.id,
      title: raw.contactName,
      description: raw.personName,
      date: raw.createdAt,
      link: 'https://app.holded.com/crm/leads',
      raw: raw
    };

    items.push(item);
  }

  return { items };
}