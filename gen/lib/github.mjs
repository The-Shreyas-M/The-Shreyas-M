// GitHub data layer for R4/R5 (Sprint 3 interface). Zero deps: Node >= 20 fetch.
// Token: GITHUB_TOKEN (the Action) or the local `gh auth token`. `--fixture` reads gen/fixtures/<name>.json
// (raw GraphQL `data` objects, same shape as a live response) so generators run offline.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const LOGIN = 'The-Shreyas-M';

export const STATS_QUERY = `query($login:String!){user(login:$login){login name followers{totalCount}
repositories(ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC,first:100,orderBy:{field:STARGAZERS,direction:DESC}){totalCount
nodes{stargazerCount languages(first:10,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}}
contributionsCollection{totalCommitContributions totalPullRequestContributions totalIssueContributions
contributionCalendar{totalContributions}}}}`;

export const CONTRIB_QUERY = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{
totalContributions weeks{contributionDays{date contributionCount contributionLevel weekday}}}}}}`;

const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
}

export async function graphql(query, variables = { login: LOGIN }) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token()}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-readme-gen' },
    body: JSON.stringify({ query, variables }),
  });
  const j = await res.json();
  if (!res.ok || j.errors) throw new Error(`GraphQL ${res.status}: ${JSON.stringify(j.errors || j).slice(0, 300)}`);
  return j.data;
}

export const fixturePath = (name) => fileURLToPath(new URL(`../fixtures/${name}.json`, import.meta.url));
const raw = async (name, query, fixture) => (fixture ? JSON.parse(readFileSync(fixturePath(name), 'utf8')) : graphql(query));

/** → { login, name, followers, repos, stars, commits, prs, issues, contributions, languages: [{ name, color, pct }] (top 5, pct 0..100, 1 dp) } */
export function normalizeStats(data) {
  const u = data.user, cc = u.contributionsCollection, bytes = {}, color = {};
  for (const r of u.repositories.nodes) for (const e of r.languages.edges) {
    bytes[e.node.name] = (bytes[e.node.name] || 0) + e.size; color[e.node.name] = e.node.color || '#8b8b8b';
  }
  const total = Object.values(bytes).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(bytes).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, b]) => ({ name, color: color[name], pct: Math.round((b / total) * 1000) / 10 }));
  return {
    login: u.login, name: u.name || u.login, followers: u.followers.totalCount,
    repos: u.repositories.totalCount, stars: u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0),
    commits: cc.totalCommitContributions, prs: cc.totalPullRequestContributions, issues: cc.totalIssueContributions,
    contributions: cc.contributionCalendar.totalContributions, languages,
  };
}

/** → { total, weeks, days: [{ date, count, level 0..4, week 0..weeks-1, weekday 0..6 (Sun=0) }] } */
export function normalizeContrib(data) {
  const cal = data.user.contributionsCollection.contributionCalendar, days = [];
  cal.weeks.forEach((w, week) => w.contributionDays.forEach((d) =>
    days.push({ date: d.date, count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0, week, weekday: d.weekday })));
  return { total: cal.totalContributions, weeks: cal.weeks.length, days };
}

export const loadStats = async ({ fixture = false } = {}) => normalizeStats(await raw('stats', STATS_QUERY, fixture));
export const loadContrib = async ({ fixture = false } = {}) => normalizeContrib(await raw('contrib', CONTRIB_QUERY, fixture));
export const wantsFixture = () => process.argv.includes('--fixture');
