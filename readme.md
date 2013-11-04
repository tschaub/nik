# `nik`
**Create a new package based on an existing one**

Nik (as in "nick") lets you quickly start a new project based on an existing Node package.  Host your project templates on [npmjs.org](http://npmjs.org/) or [GitHub](https://github.com/) and you can set up a new project in a snap:

    nik my-project-template

If you want to start a project based on a specific release of a package, use the `nik <pkg>@<version>` syntax:

    nik some-other-cool-module@2.3.5

The examples above use Node package names from the [`npm` registry](http://npmjs.org/).  You can also use `nik` to create a new project from any Node package on GitHub with `nik <github username>/<github project>`:

    nik some-user/some-package

With `nik`, you can bootstrap a project from a `npm` hosted package (with or without a version), a local package, a tarball URL, or any GitHub hosted Node package.  Any of the following forms will work:

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

    npm install -g --production nik

## Use it

Create a new directory for your new package:

    mkdir foo

Now change into that directory, and `nik` a package to start with:

    cd foo
    nik bar

You'll be prompted for a few questions (similar to `npm init`).  When you're done, you'll have a new module ready to be `npm install`ed, pushed up to GitHub, or published anywhere else.

## Credit where credit is due

The point of `nik` is not to use someone else's work without permission or proper attribution.  Make sure you read the license of the package you're starting with (the same license is applied to your package by default).  And give proper credit to the original author.

## Motivation

The primary motivation of `nik` is to make it easy to start a new project with some existing scaffolding.  Think of it as [Yeoman](http://yeoman.io/)-extra-light or `npm init` on steroids.  The idea is that people will host templates or project scaffolding on on [npmjs.org](http://npmjs.org/) or [GitHub](https://github.com/), and you can use `nik` to bootstrap your project.

Please [submit an issue](https://github.com/tschaub/nik/issues) if you encounter any trouble.  Contributions or suggestions for improvements welcome!

[![Current Status](https://secure.travis-ci.org/tschaub/nik.png?branch=master)](https://travis-ci.org/tschaub/nik)
