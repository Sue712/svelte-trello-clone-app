import { writable } from 'svelte/store'
import cryptoRandomString from 'crypto-random-string'
//lodash 일부기능만 사용할건데 전체 다가지고 오면 무거워질 수 있으므로 사용하는 모듈만 프로젝트에 적용해서 사용
//따라서 아래와같이 일부기능인 find / remove만 사용한다.
import _find from 'lodash/find'
import _remove from 'lodash/remove'
import _cloneDeep from 'lodash/cloneDeep'
const crypto = () => cryptoRandomString({ length: 10 })
//JSON parse를 통해 문자데이터를 객체 데이터로 바꿔주고 활용하자
const repoLists = JSON.parse(window.localStorage.getItem('lists')) || []


//내부에서만 사용하는 데이터는 '_'
const _lists = writable(repoLists)
//$lists 여기서는 자동구독 아닌 그냥 데이터
_lists.subscribe($lists => {
    window.localStorage.setItem('lists', JSON.stringify($lists))
})

//커스텀 스토어
export const lists = {
    subscribe: _lists.subscribe, //() 이거는 실행이고 그냥 할당만 한다 (밖에서 자동구독을 위해)

    reorder(payload) {
        // List의 이전 위치와 새 위치를 이용합니다.
        const { oldIndex, newIndex } = payload
        _lists.update($lists => {
            // 사용자가 움직이는(드래그하는) 그 List를 복제합니다.
            const clone = _cloneDeep($lists[oldIndex])
            // Lists에서 이전 위치의 해당 List를 제거하고,
            $lists.splice(oldIndex, 1)
            // 새 위치에 복제한 List를 끼워넣습니다.
            $lists.splice(newIndex, 0, clone)
            // 스토어(`_lists`)에 반영!
            return $lists
        })
    },

    //우리가 쓰려는 함수를 여기에 정의
    add(payload) {
        //payload는 객체데이터 내부의 title이라는 속성을 구조분해를 통해 꺼내서 실제 _lists 데이터에 반영
        const { title } = payload
        _lists.update($lists => {
            $lists.push({
                id: crypto(),
                title,
                cards: []
            })
            return $lists
        })
    },

    edit(payload) {
        const { listId, title } = payload
        _lists.update($lists => {
            //수정로직
            // const foundList = $lists.find((l) => {
            //     return l.id === listId
            // })
            const foundList = _find($lists, { id: listId })
            foundList.title = title;
            return $lists
        })
    },
    remove(payload) {
        const { listId } = payload
        _lists.update($lists => {
            //삭제로직
            _remove($lists, { id: listId })
            return $lists
        })
    }

}

//cards
//커스텀스토어 아닌 객체데이터 (subscribe 사용안하기 때문에)
export const cards = {
    reorder(payload) {
        const {
            fromListId, toListId, oldIndex, newIndex
        } = payload

        _lists.update($lists => {
            // 출발한 위치의 List를 찾습니다.
            const fromList = _find($lists, { id: fromListId })
            // 도착한 위치의 List를 찾되,
            // 만약에 출발 위치와 도착 위치가 같으면,
            // `_find`가 동작할 필요없이(추가로 찾을 필요없이),
            // 위에서 찾아 놓은 출발 위치 List를 할당합니다.(그 List가 그 List이니까요!)
            const toList = fromListId === toListId
                ? fromList
                : _find($lists, { id: toListId })
            // Card 복사본을 생성합니다.
            const clone = _cloneDeep(fromList.cards[oldIndex])
            // 이전 위치의 해당 Card를 제거하고,
            fromList.cards.splice(oldIndex, 1)
            // 새 위치에 복사한 Card를 끼워넣습니다.
            toList.cards.splice(newIndex, 0, clone)
            // 스토어(_lists)에 반영!
            return $lists
        })
    },
    add(payload) {
        const { listId, title } = payload
        _lists.update($lists => {
            // 해당 Card가 포함된 List 찾습니다.
            const foundList = _find($lists, { id: listId })

            // 찾은 List에 새로운 카드를 생성해서 밀어 넣습니다.
            foundList.cards.push({
                id: crypto(), // Card의 고유 ID
                title // Card 제목
            })
            // 스토어(_lists)에 반영!
            return $lists
        })
    },
    edit(payload) {
        const { listId, cardId, title } = payload
        _lists.update($lists => {
            const foundList = _find($lists, { id: listId })
            const foundCard = _find(foundList.cards, { id: cardId })
            foundCard.title = title
            return $lists
        })
    },
    remove(payload) {
        const { listId, cardId } = payload

        _lists.update($lists => {
            const foundList = _find($lists, { id: listId })
            _remove(foundList.cards, { id: cardId })
            return $lists
        })
    }
}