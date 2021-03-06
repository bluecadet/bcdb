# BCDB

:warning: | THIS PROJECT IS NO LONGER MAINTAINED
:---: | :---

## **BCDB is now part of [Cadet](https://github.com/bluecadet/cadet) (see `cadet pull`)**

## Deprecated

Easily pull databases and files from Pantheon to a local MAMP instance.

### Installation

#### [Install MAMP](https://www.mamp.info/en/downloads/)

#### [Install Terminus](https://pantheon.io/docs/terminus/install/)

In Terminal, run:

```
$ cd ~

$ curl -O https://raw.githubusercontent.com/pantheon-systems/terminus-installer/master/builds/installer.phar && php installer.phar install
```

If you do not have a Pantheon Machine token, [generate one](https://dashboard.pantheon.io/login?destination=%2Fuser#account/tokens/create/terminus/). *Copy the machine token to your clipboard*

Authenticate Terminus in Terminal:

```
$ terminus auth:login --machine-token=[MACHINE_TOKEN_VALUE]
```

Additionally, [generate and/or add an SSH key](https://pantheon.io/docs/ssh-keys/). This will allow you to easily pull files from a site.


#### Install BCDB

```
$ npm install -g @bluecadet/bcdb
```


### Usage

#### config

After installing BCDB, run `bcdb config`. You will be asked to enter your Pantheon Machine Token.

#### init

In a project root directory, run `bcdb init`. This will ask a series of questions to initialize project configuration.


#### pull [--force] [-f] [--exclude=file/path]

Run `bcdb pull` to pull a database or files from a specfic Pantheon enviornment

To override the backup expiration and force a new database backup to be created, use the
`--force` or `-f` flag:

```
$ bcdb pull -f
```

You can optionally pass directories or other rsync `exclude` parameters with the `--exclude=` argument. Seperate excludes with a comma:

```
$ bcdb pull --exclude=files/path
$ bcdb pull --exclude=files/path,another/path
```
