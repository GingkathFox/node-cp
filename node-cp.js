#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const {
    dir
} = require('console')
const IGNORE_FILE = `.cpignore`

let args = process.argv
args.splice(0, 2)
const FLAGS = [
    `r`,
    `v`
]
let recursive = false
let verbose = false
if (args[0].startsWith(`-`)) {
    let flag = FLAGS.find(e => e === args[0].split('')[1])
    switch (flag) {
        case 'r': {
            recursive = true
            break
        }
        case 'v': {
            verbose = true
            break
        }
        default: {
            break
        }
    }
    args.shift()
}
const fromDir = args[0]
const toDir = args[1]

const copyRecursiveSync = function copyRecursiveSync(src, dest) {
    fs.copySync(src, dest);

    fs.readdirSync(src)
        .map((name) => name)
        .filter((dir) => fs.lstatSync(path.join(src, dir)).isDirectory())
        .forEach((dir) => {
            copyRecursiveSync(path.join(src, dir), path.join(dest, dir))
        })
}
function nodecp(from, to) {
    // Checking if exists
    if (!fs.existsSync(to)) {
        console.error(`The directory ${to} does not exist.`)
        process.exit(1)
    }
    if (!fs.existsSync(from)) {
        console.error(`The file or folder you are trying to copy does not exist.`)
        process.exit(1)
    }
    if (fs.lstatSync(from).isDirectory()) {
        process.chdir(from)
    }
    // Single file copying
    if (!recursive) {
        try {
            if (verbose) {
                console.log(`Copying ${from} to ${to}...`)
            }
            if (fs.existsSync(to) && fs.lstatSync(to).isDirectory()) {
                fs.copySync(from, `${to}/${path.basename(from)}`)
            } else {
                fs.copySync(from, to)
            }
            console.log(`Success.`)
            process.exit(0)
        } catch (e) {
            console.error(`A error happened while copying ${from} to ${to}:\n${e}`)
            process.exit(1)
        }
    }

    // directory copying
    let fileExists = fs.existsSync(`./${IGNORE_FILE}`)
    if (fileExists) {
        const targetFolder = `${to}/${path.basename(from)}`

        let ignored = fs.readFileSync(`./${IGNORE_FILE}`, 'utf8')
        ignored = ignored.split('\n')
        console.log(ignored)
        if (!ignored[0]) {
            fs.copySync(from, `${from}/${path.basename(to)}`)
            process.exit()
        }
        let directories = fs.readdirSync(from)
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder)
        }
        process.chdir(targetFolder)
        let cwd = process.cwd()
        for (let dir of directories) {
            if (!ignored.includes(dir)) {
                //let fullDir = path.join(from, dir)
                //let fullToDir = path.join(__dirname, to)
                try {
                    if (!verbose) {
                        console.log(`Copying ${from}/${dir} to ${to}...`)
                    }
                    //fs.mkdirSync(`${to}/${path.basename(from)}`)
                    fs.copySync(`${from}/${dir}`, `${cwd}/${dir}`)
                } catch (e) {
                    console.error(`A error happened while copying ${from} to ${to}:\n${e}`)
                    process.exit(1)
                }
            }
        }
        process.exit()
    }
    fs.copySync(from, `${to}/${path.basename(from)}`)
    process.exit()
}
nodecp(fromDir, toDir)