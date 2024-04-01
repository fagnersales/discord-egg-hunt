import fs from "fs"
import path from "path"

export function load_folder_recursively(initial_path: string) {
    read_folder(initial_path)

    function read_folder(dir_path: string) {
        const files = fs.readdirSync(dir_path)

        for (const file of files) {
            read_file(path.join(dir_path, file))
        }
    }

    function read_file(file_path: string) {
        const file = fs.lstatSync(file_path)

        if (file.isFile()) require(file_path)

        if (file.isDirectory()) {
            read_folder(file_path)
        }
    }
}