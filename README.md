[![MIT License][license-image]][license-url]

# Create fake Github contributions

Most of my Github contributions are on private repositories or they weren't considered (this is [how Gihub counts
contributions](https://help.github.com/articles/why-are-my-contributions-not-showing-up-on-my-profile).

So I thought it would be fun to make my visitors feeling welcome when they visit my profile page.

![Contribution message](https://github.com/croman/contributions/raw/master/images/message.png)

## How it works

The application creates a public repository and the necessary commits associated with the message you want to be
displayed. Your other contributions will still be visible and could interfere with the message (how much depends on the
message and your public activity).

### OAuth token

The application needs an [OAuth](https://developer.github.com/v3/oauth/) token to create the repository and push the
commits. The only [scope](https://developer.github.com/v3/oauth/#scopes) required is `public_repo`. To create a token
go to the [token setting](https://github.com/settings/tokens/new) page in your Github account.

Keep the generated token in a safe place!

### Generate message

```bash
npm install;
GITHUB_TOKEN=<oauth-token> GITHUB_USER=<username> MESSAGE="HI THERE <smiley-face>" node index.js
```

The command will create a new repository (`fake-contributions`) for that user, clone it (in the same folder where you
cloned this repository), create and push the commits. To reset the contributions simply delete the repository.

You can override the default repository name by passing `GITHUB_CONTRIBUTIONS_REPOSITORY=<repo-name>` to the above
command.

### Messages and fonts

The characters accepted in the message must be defined in the used font. All fonts are located in the `fonts` folder.
You can override the default font (height7) by passing the `FONT=<font-name>` to the command.

The default font accepts letters A to Z, space and the special smiley-face construct.

The format of font files is as follows:

 - first line is the character identifier (e.g. A)
 - empty line that marks the beginning of the character matrix
 - several lines (up to 7) of space delimited numbers, starting from 0. As values increase so does the intensity of the
   green color in the contributions grid
 - empty line marking the character ending declaration

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
