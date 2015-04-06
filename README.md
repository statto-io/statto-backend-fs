# statto-backend-leveldb #

A simple, slow and stupid statto backend for the filesystem (fs).

## Synopsis ##

See the example file: `example/server.js`.

## Description ##

This is an example statto backend such that it implements the bare basics as an example of what you can do and to just
get something working. It stores all data files into a single directory (which might fill up) and when it is asked for
stats from the frontends, it endeavors to read all files in, parses them, spits out the data and them forgets about
them. It is so simple and inefficient it is a bit silly, but that's the whole point so you can see how things work.

It is also an example backend which the tests in `statto-backend` can test for compliance.

## Author ##

Written by [Andrew Chilton](http://chilts.org/) - [Twitter](https://twitter.com/andychilton).

Written for [Tynio](https://tyn.io/).

## License ##

The MIT License (MIT). Copyright 2015 Tynio Ltd.

(Ends)
