import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/leowiemelt/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        writable: false,
        enumerable: false,
        configurable: false,
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Compute file stats
  const files = d3.groups(data, d => d.file).map(([file, lines]) => ({ file, lines }));
  const numFiles = files.length;
  const maxFileLength = d3.max(files, f => f.lines.length);
  const longestFile = files.find(f => f.lines.length === maxFileLength)?.file;
  const avgFileLength = d3.mean(files, f => f.lines.length);
  const avgLineLength = d3.mean(data, d => d.length);
  const maxLineLength = d3.max(data, d => d.length);
  const longestLine = data.find(d => d.length === maxLineLength);
  const maxDepth = d3.max(data, d => d.depth);
  const deepestLine = data.find(d => d.depth === maxDepth);
  const avgDepth = d3.mean(data, d => d.depth);
  const avgFileDepth = d3.mean(files, f => d3.max(f.lines, l => l.depth));

  // Day of week stats
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = d3.rollup(commits, v => v.length, d => d.datetime.getDay());
  const mostWorkDayIndex = Array.from(dayCounts.entries()).reduce((a, b) => dayCounts.get(a[0]) > dayCounts.get(b[0]) ? a : b)[0];
  const mostWorkDay = days[mostWorkDayIndex];

  // Add stats
  dl.append('dt').text('Number of files');
  dl.append('dd').text(numFiles);

  dl.append('dt').text('Maximum file length (lines)');
  dl.append('dd').text(maxFileLength);

  dl.append('dt').text('Longest file');
  dl.append('dd').text(longestFile);

  dl.append('dt').text('Average file length (lines)');
  dl.append('dd').text(avgFileLength.toFixed(2));

  dl.append('dt').text('Average line length (characters)');
  dl.append('dd').text(avgLineLength.toFixed(2));

  dl.append('dt').text('Longest line length');
  dl.append('dd').text(maxLineLength);

  dl.append('dt').text('Longest line');
  dl.append('dd').text(`${longestLine.file}:${longestLine.line}`);

  dl.append('dt').text('Maximum depth');
  dl.append('dd').text(maxDepth);

  dl.append('dt').text('Deepest line');
  dl.append('dd').text(`${deepestLine.file}:${deepestLine.line}`);

  dl.append('dt').text('Average depth');
  dl.append('dd').text(avgDepth.toFixed(2));

  dl.append('dt').text('Average file depth');
  dl.append('dd').text(avgFileDepth.toFixed(2));

  dl.append('dt').text('Day of week most work done');
  dl.append('dd').text(mostWorkDay);

}

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);