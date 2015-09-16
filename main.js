#!/usr/bin/node

"use strict"

var configPath = "/etc/zfs-snapd-config.json"

var repos = {}

var fs   = require('fs')
var path = require('path')

var zfs     = require('zfs')
var async   = require('async')
var connect = require('connect')
var express = require('express')

var app = express()

readConfig()

app.use(connect.urlencoded())
app.use(connect.basicAuth(function(user, pass) {
	if(!(user in repos)) {
		return false
	}
	return pass === repos[user]['password']
}))


function readConfig() {
	try {
		repos = JSON.parse(fs.readFileSync(configPath))
		console.log('Loaded ' + Object.keys(repos).length + ' repositories from config')
	} catch(err) {
		console.log('Failed parsing config file: ' + err)
	}
}


function createSnapshot(repo, name, cb) {
	zfs.snapshot({
		dataset: repos[repo].fs,
		name: name
	}, cb)
}

function listSnapshots(repo, cb) {
	zfs.list({type: 'snapshot', recursive: true, name: repos[repo].fs}, function(err, list) {
		if(err) {
			cb(err)
			return
		}
		var snapshots = []
		list.forEach(function(s) {
			var splitname = s.name.split('@')
			if(splitname[0] == repos[repo].fs) {
				snapshots.push(splitname[1])
			}
		})
		cb(null, snapshots)
	})
}

function destroySnapshot(repo, name, cb) {
	zfs.destroy({
		name: repos[repo].fs + '@' + name
	}, cb)

}

function createAlias(repo, source, target, cb) {
	var base = '/' + repos[repo].fs
	fs.symlink(
		base + '/.zfs/snapshot/' + source,
		base + '/.alias/'        + target,
		cb
	)
}

function destroyAlias(repo, name, cb) {
	fs.unlink('/' + repos[repo].fs + '/.alias/' + name, cb)
}

function listAlias(repo, cb) {
	var dir = '/' + repos[repo].fs + '/.alias/'
	fs.readdir(dir, function(err, files) {
		if(err) {
			cb(err)
			return
		}
		var absolute_files = []
		files.forEach(function(f) {absolute_files.push(dir + f)})
		async.map(absolute_files, fs.readlink, function(err, results) {
			if(err) {
				cb(err)
				return
			}
			var r = {}
			for(var i = 0; i < results.length; i++) {
				r[files[i]] = path.basename(results[i])
			}
			cb(null, r)
		})

	})
}

function validName(name) {
	if(name === undefined) return false
	return /^[a-zA-Z0-9_\-.]+$/.test(name)
}

app.get('/snapshot', function(req, res) {
	listSnapshots(req.user, function(err, list) {
		if(err) {
			res.json(500, {'status': 'error', 'error': err, 'message': err.toString('utf-8')})
			return
		}
		res.json(list)
	})
})

app.post('/snapshot', function(req, res) {
	if(!validName(req.body.name)) {
		res.json(406, {'status': 'error', 'error': 'invalid name'})
		return
	}

	createSnapshot(req.user, req.body.name, function(err, list) {
		if(err) {
			res.json(500, {'status': 'error', 'error': err, 'message': err.toString('utf-8')})
			return
		}
		res.json({'status': 'success'})
	})
})

app.delete('/snapshot', function(req, res) {
	if(!validName(req.body.name)) {
		res.json(406, {'status': 'error', 'error': 'invalid name'})
		return
	}

	destroySnapshot(req.user, req.body.name, function(err, list) {
		if(err) {
			res.json(500, {'status': 'error', 'error': err, 'message': err.toString('utf-8')})
			return
		}
		res.json({'status': 'success'})
	})
})



app.get('/alias', function(req, res) {
	listAlias(req.user, function(err, list) {
		if(err) {
			res.json(500, {'status': 'error', 'error': err, 'message': err.toString('utf-8')})
			return
		}
		res.json(list)
	})
})

app.post('/alias', function(req, res) {
	if(!validName(req.body.source)) {
		res.json(406, {'status': 'error', 'error': 'invalid name'})
		return
	}

	if(!validName(req.body.target)) {
		res.json(406, {'status': 'error', 'error': 'invalid target'})
		return
	}

	createAlias(req.user, req.body.source, req.body.target, function(err, list) {
		if(err) {
			res.json(500, {'status': 'error', 'error': err, 'message': err.toString('utf-8')})
			return
		}
		res.json({'status': 'success'})
	})
})

app.put('/alias', function(req, res) {
	if(!validName(req.body.source)) {
		res.json(406, {'status': 'error', 'error': 'invalid name'})
		return
	}

	if(!validName(req.body.target)) {
		res.json(406, {'status': 'error', 'error': 'invalid target'})
		return
	}

	destroyAlias(req.user, req.body.target, function(err, list) {
		createAlias(req.user, req.body.source, req.body.target, function(err, list) {
			if(err) {
				res.json(500, {'status': 'error', 'error': err, 'message': err.toString('utf-8')})
				return
			}
			res.json({'status': 'success'})
		})
	})
})

app.delete('/alias', function(req, res) {
	if(!validName(req.body.name)) {
		res.json(406, {'status': 'error', 'error': 'invalid name'})
		return
	}

	destroyAlias(req.user, req.body.name, function(err, list) {
		if(err) {
			res.json(500, {'status': 'error', 'error': err, 'message': err.toString('utf-8')})
			return
		}
		res.json({'status': 'success'})
	})
})


app.listen(process.env.PORT || 8080, process.env.HOST || '::1')

process.on('SIGHUP', readConfig)
