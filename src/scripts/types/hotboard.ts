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
    name: string,
    url: string,
    maxRound: number,
}

const emptyData: CardData = {
    title: '',
    image: '',
    description: '',
    dateTime: '',
}

export { CardData, HotboardData, HotboardSource, emptyData };