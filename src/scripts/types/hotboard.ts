interface CardData {
    hotScore: number,
    img: string,
    index: number,
    word: string,
}

interface BaiduHotboardData {
    data: {
        cards: [
            {
                updateTime: string,
                content: CardData[],
            }
        ],
    }
}

export { CardData, BaiduHotboardData };