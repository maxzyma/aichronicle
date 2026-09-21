import { loadContent } from '../../automation/checks/content.mjs';
import { isApproved } from '../../automation/checks/model.mjs';
export const review = process.env.REVIEW_PREVIEW === '1';
const data = loadContent();
export const events = data.events.filter((e) => review || isApproved(e, data.sources, data.timelines, data.approvals));
export const timelines = data.timelines;
export const sources = data.sources;
export const batch = data.batch;
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const href = (route = '') => `${base}/${route.replace(/^\//, '')}`;
export const labels = {research: '基础研究', models: '模型与能力', products: '产品与应用', infrastructure: '基础设施', governance: '治理与安全', science: '科学发现'};
export const inTimeline = (id) => events.filter((e) => timelines.find((t) => t.id === id)?.entries.some((entry) => entry.event === e.id));

export const stages = {research:'研究提出',preview:'早期预览',availability:'开放／发布',adoption:'采用信号',governance:'治理变化',practice:'工程实践'};
