function format(str: string, ...args: any[]) {
    return str.replace(/{(\d+)}/g, (match, number) => {
        return "" + (args[number] ?? match);
    });
}

export { format };