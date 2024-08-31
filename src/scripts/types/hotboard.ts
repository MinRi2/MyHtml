interface CardData {
    title: string,
    image: string,
    description?: string,
    dateTime?: string,
}

interface HotboardData {
    updateTime: string,
    result: CardData[],
}

interface HotboardSource {
    name: ValidHotboardSource,
    url: string,

    disable?: boolean,
    round: number,
}

type ValidHotboardSource = "百度热搜" | "央视国际新闻" | "央视军事新闻";

const emptyData: CardData = {
    title: '',
    image: '',
    description: '',
    dateTime: '',
}

export { CardData, HotboardData, HotboardSource, ValidHotboardSource, emptyData };