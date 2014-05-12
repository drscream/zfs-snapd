#!/usr/bin/node

"use strict"

var configPath = "/etc/zfs-snapd-config.json"

var repos = {}

var fs = require('fs')
var zfs = require('zfs')
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
	zfs.list({type: 'snapshot'}, function(err, list) {
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

function validName(name) {
	return /^[a-zA-Z0-9_\-.]+$/.test(name)
}

app.get('/', function(req, res) {
	listSnapshots(req.user, function(err, list) {
		if(err) {
			res.json({'error': err})
			return
		}
		res.json(list)
	})
})

app.post('/', function(req, res) {
	if(!validName(req.body.name)) {
		res.json({'error': 'invalid name'})
		return
	}

	createSnapshot(req.user, req.body.name, function(err, list) {
		if(err) {
			res.json({'status': 'error', 'error': err})
			return
		}
                res.json({'status': 'success'})
	})
})

app.delete('/', function(req, res) {
	if(!validName(req.body.name)) {
		res.json({'error': 'invalid name'})
		return
	}

	destroySnapshot(req.user, req.body.name, function(err, list) {
		if(err) {
			res.json({'status': 'error', 'error': err})
			return
		}
		res.json({'status': 'success'})
	})
})

app.listen(process.env.PORT || 8080, process.env.HOST || '::1')

process.on('SIGHUP', readConfig)
