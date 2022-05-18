# gatsby-source-gitlab-issue

> Gatsby.js source plugin for loading issues from GitLab

Learn more about [Gatsby](https://www.gatsbyjs.org/) and its plugins here: [https://www.gatsbyjs.org/docs/plugins/](https://www.gatsbyjs.org/docs/plugins/) <br />

## Install

```bash
npm install gatsby-source-gitlab-issue
```

## How to use

```js
// gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-gitlab-issue`,
    options: {
      // You can get your access token on your GitLab profile
      accessToken: 'your access token here',

      // Specify the path to your repo as $OWNER/$REPO
      path_with_namespace: 'staltz/manyverse', // example

      // Optionally provide labels to get only issues with any of these
      labels: ['work-in-progress', 'todo'], // example
    }
  },
]
```

## GraphQL Queries

To see all possible queries please use the GraphiQL editor which is available under ``http://localhost:8000/___graphql``

### Get all projects of the user:

```graphql
query {
  allGitlabIssue {
    edges {
      node {
        title
        id
        iid
        description
        state
        created_at
        updated_at
        webUrl
        confidential
        assignees {
          id
          username
          name
          state
          avatar_url
          web_url
        }
        labels {
        	name
          priority
          id
          description
          description_html
          color
          text_color
          subscribed
          priority
          is_project_label
        }
      }
    }
  }
}
```

## License

MIT
