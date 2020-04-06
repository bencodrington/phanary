# Contributing
Thanks for considering contributing to Phanary's continuing development!

There are all kinds of contributions that the project could benefit from, even minor changes like catching **spelling and formatting errors**.

Please consider submitting **bug reports** and **feature requests** and writing code to offer **optimizations**, new **functionality**, and **improvements**.

# Responsibilities
* Ensure cross-browser compatibility and mobile responsiveness for every change that's accepted. Chrome, Firefox, and Safari, at the very least.
* [Open a new issue](https://github.com/bencodrington/phanary/issues/new) for any major change and enhancement that you wish to make. Discuss things transparently and get community feedback.
* Avoid adding any classes to the codebase unless absolutely needed. Err on the side of using functions.
* Be welcoming to newcomers and encourage diverse new contributors from all backgrounds. See the [Contributor Covenant](https://github.com/bencodrington/phanary/blob/master/.github/CODE_OF_CONDUCT.md).

# Submitting Changes

1. [Create your own fork](https://help.github.com/articles/fork-a-repo/) of the repository.
2. Clone the repository.
3. Ensure that you have a recent version of [Node.js](https://nodejs.org/en/download/) installed locally.
4. From the repository's root folder, run `npm install` to install package dependencies.
5. Install Handlebars template precompiler: `npm install -g handlebars@^4.7.3`.
6. If not already installed, install the [Gulp Command Line Utility](https://gulpjs.com/docs/en/getting-started/quick-start).
7. Set up database:
    1. Install [MongoDB](mongodb.com) and run it (Note: on Windows, running `./mongod` may be required, or double-clicking `mongod.exe`).
    2. From the repository's root folder, run the following commands to import the most recent backups of the database (after inserting the correct path to MongoDB for your system, which on Windows should look something like `/c/Program\ Files/MongoDB/Server/4.2/bin/`):
    ```
    [/Path/To/MongoDB/Server/4.2/bin/]mongoimport.exe -d phanary -c atmospheres --drop --file db_backups/atmospheres.js
    [/Path/To/MongoDB/Server/4.2/bin/]mongoimport.exe -d phanary -c tracks --drop --file db_backups/tracks.js
    [/Path/To/MongoDB/Server/4.2/bin/]mongoimport.exe -d phanary -c oneshots --drop --file db_backups/oneshots.js
    ```
    3. Run `[/Path/To/MongoDB/Server/4.2/bin/]mongo 127.0.0.1:27017 phanaryInit.js`  to initialize the 'phanary' database on the currently running instance of `mongod`. This step adds the 'text' indices necessary for searching the database.
    4. You should see `Phanary Database Initialization complete.` in your console window.
8. Run `npm start` from the repository's root directory to connect to MongoDB, and open up a live-updating preview of the site in your browser.
9. Make your changes.
10. Submit a pull request for review.

> Note: You'll only be able to play tracks and one-shots that have been added to the database and have been processed using the `gulp audio` command. After being processed, output is placed in the `public/audio/converted` directory.

> Note: You can expect a response from a maintainer within 7 days. If you haven’t heard anything by then, feel free to send an email to phanarydev@gmail.com.


# Bug Reporting

> Note: **Please avoid using the issue tracker for support questions**.

Until an FAQ page is created, we'd be happy to field questions about using Phanary at phanarydev@gmail.com.

> Note: If you find anything you think could be a security vulnerability, please do **NOT** open an issue. E-mail phanarydev@gmail.com instead.

When [opening an issue](https://github.com/bencodrington/phanary/issues/new), make sure to answer all relevant questions in the issue template.

# How to Suggest a Feature or Enhancement

> ### The Phanary Philosophy
>
> Phanary was designed and built to be a **powerful**, **fast**, and **free** option for RPG game masters to use to provide atmospheric music and sound effects.
>
> Its primary utility lies in its effectiveness at searching and playing relevant sounds as quickly as possible.
>
> The success of this project can be measured by how well it can be used unobtrusively in a game session to maintain pacing, flow, and immersion.

Phanary has an [extensive to-do list](https://github.com/bencodrington/phanary/projects) of features to add and enhancements to make, many of which have been born directly from user suggestions and ideas.
[Open an issue](https://github.com/bencodrington/phanary/issues/new) that describes the feature you would like to see, why you need it, and how it should work.

# Code Style

* **CamelCase** should be used for class and variable names.
* JavaScript class names should start with a **Capital**.
* CSS classes should be named using [The **BEM** Approach](http://getbem.com/naming/).