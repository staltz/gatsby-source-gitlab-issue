const Gitlab = require('gitlab/dist/es5').default;
const crypto = require('crypto');

exports.sourceNodes = async ({ actions: { createNode } }, configOptions) => {
  if (!configOptions.accessToken) {
    throw 'You need to enter an accessToken';
  }

  const api = new Gitlab({ token: configOptions.accessToken });
  const inputLabels = configOptions.labels;
  const pathWithNamespace = configOptions.path_with_namespace;

  const projects = await api.Projects.all({ owned: true });

  function addIssueToGraphQL(issue, allLabels) {
    const labels = issue.labels.map(name =>
      allLabels.find(label => label.name === name),
    );
    const issueNode = {
      id: issue.id.toString(),
      iid: issue.iid.toString(),
      title: issue.title,
      description: issue.description,
      state: issue.state,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      webUrl: issue.web_url,
      labels,
      confidential: issue.confidential,
      assignees: issue.assignees,
      children: [],
      parent: `__SOURCE__`,
      internal: {
        type: `GitlabIssue`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(issue))
          .digest(`hex`),
      },
    };
    createNode(issueNode);
  }

  for (const project of projects) {
    if (project.path_with_namespace !== pathWithNamespace) continue;

    const allLabels = await api.Labels.all(project.id);
    const labels = [];
    if (inputLabels) {
      for (const label of allLabels) {
        if (inputLabels.includes(label)) {
          labels.push(label);
          continue;
        }
        for (const wildCardLabel of inputLabels.filter(l => l.includes('*'))) {
          const regex = new RegExp(wildCardLabel.replace('*', '\\S+'));
          if (regex.test(label.name)) {
            labels.push(label);
            continue;
          }
        }
      }
    }

    if (labels.length > 0) {
      for (const label of labels) {
        const issues = await api.Issues.all({
          projectId: project.id,
          labels: label.name,
        });
        for (const issue of issues) {
          addIssueToGraphQL(issue, allLabels);
        }
      }
    } else {
      const issues = await api.Issues.all({
        projectId: project.id,
      });
      for (const issue of issues) {
        addIssueToGraphQL(issue, allLabels);
      }
    }
  }
};
