# `nik`
**Create a new package based on an existing one**

Nik (as in "nick") lets you quickly start a new project based on an existing Node package.  Host your project templates on [`npmjs.org`](http://npmjs.org/) and you can set up a new project in a snap:

    nik my-project-template

You can also start a new module based on someone else's work:

    nik some-other-cool-module@2.3.5

The `nik` command takes a `<pkg>` argument in the same form as `npm install <pkg>`.  So you can supply it any of the following:

    nik <pkg>
    nik <pkg>@<tag>
    nik <pkg>@<version>
    nik <pkg>@<version range>
    nik <folder>
    nik <tarball file>
    nik <tarball url>
    nik <git:// url>
    nik <github username>/<github project>

## Get it

Install `nik` globally with the following:

    npm install -g nik

## Use it

Create a new directory for your package:

    mkdir foo

Now change into that directory, and `nik` a package to start with:

    cd foo
    nik bar

You'll be prompted for a few questions (similar to `npm init`).  When you're done, you'll have a new module ready to be `npm install`ed, pushed up to GitHub, or published anywhere else.

## Credit where credit is due

The point of `nik` is not to use someone else's work without permission or proper attribution.  Make sure you read the license of the package you're starting with (the same license is applied to your package by default).  And give proper credit to the original author.

## Motivation

The primary motivation of this project is to make it easy to start a new project with some existing scaffolding.  Think of it as [Yeoman](http://yeoman.io/)-extra-light.  The idea is that people can publish reusable project scaffolding on [npmjs.org](http://npmjs.org/).
