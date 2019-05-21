'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api('/projects/v1/tasks');
    if ($.isErrorResponse(activity, response)) return;

    // we do not have good way to get all tasks
    const value = response.body.length;

    const pagination = $.pagination(activity);
    let pagiantedItems = api.paginateItems(response.body,pagination);

    activity.Response.Data.items = convertResponse(pagiantedItems);
    activity.Response.Data.title = T(activity, 'Active Tasks');
    activity.Response.Data.link = `https://app.holded.com/projects/`;
    activity.Response.Data.linkLabel = T(activity, 'All Tasks');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} tasks.", value)
        : T(activity, "You have 1 task.");
    } else {
      activity.Response.Data.description = T(activity, `You have no tasks.`);
    }
    activity.Response.Data._nextpage = response.body['@odata.nextLink'];
  } catch (error) {
    $.handleError(activity, error);
  }
};
//**maps resposne data to items */
function convertResponse(tasks) {
  let items = [];

  for (let i = 0; i < tasks.length; i++) {
    let raw = tasks[i];
    let item = {
      id: raw.id,
      name: raw.name,
      description: raw.desc,
      date: new Date(raw.createdAt).toISOString(),
      link: `https://app.holded.com/projects/${raw.projectId}/`,
      raw: raw
    };
    items.push(item);
  }

  return { items };
}