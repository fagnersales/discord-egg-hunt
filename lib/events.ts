import { load_folder_recursively } from "./utils/load-folder-recursively"
import path from "path"

type Event = {
    event: string,
    func: ((...args: any[]) => Promise<void> | void) | (() => Promise<void> | void)
}

export const events: Event[] = []

load_folder_recursively(path.join(process.cwd(), "src", "events"))
