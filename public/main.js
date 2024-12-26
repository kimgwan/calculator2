// 탭 버튼 토글
function toggleTab(activeTab, inactiveTab) {
    document.querySelector(activeTab).classList.add('active-tab');
    document.querySelector(inactiveTab).classList.remove('active-tab');
}
//탭 페이지 토글
function togglePage(activePage, inactivePage) {
    document.querySelector(activePage).classList.remove('hide');
    document.querySelector(inactivePage).classList.add('hide');
}
// 상품 탭 버튼
if (document.querySelector('.products-menu1')) {
    document.querySelector('.products-menu1').addEventListener('click', function () {
        toggleTab('.products-menu1', '.products-menu2');
        togglePage('.products-list', '.add-products');
    });
}
// 상품 2번 탭 버튼
if (document.querySelector('.products-menu2')) {
    document.querySelector('.products-menu2').addEventListener('click', function () {
        toggleTab('.products-menu2', '.products-menu1');
        togglePage('.add-products', '.products-list');
    });
}
// 재료 1번 탭 버튼
if (document.querySelector('.materials-menu1')) {
    document.querySelector('.materials-menu1').addEventListener('click', function () {
        toggleTab('.materials-menu1', '.materials-menu2');
        togglePage('.materials-list', '.add-materials');
    });
}
// 재료 2번 탭 버튼
if (document.querySelector('.materials-menu2')) {
    document.querySelector('.materials-menu2').addEventListener('click', function () {
        toggleTab('.materials-menu2', '.materials-menu1');
        togglePage('.add-materials', '.materials-list');
    });
}
// 재료관리 재료입력 동적추가
// if (document.querySelector('#add-m-btn')) {
//     document.querySelector('#add-m-btn').addEventListener('click', function () {
//         let newAddHtml = `<form action="/save" method="POST" class="m-layout">
//                             <div class="m-items-sorting m-wrap">
//                                 <div class="m-items-sorting">
//                                     <p>재료명</p>
//                                     <input type="text" name="mname" placeholder="필수입력" required>
//                                 </div>
//                                 <button style="margin-right: 10px;" class="add-detail-open">자세히입력</button>
//                                 <button type="submit" style="margin-right: 10px;" class="save-item">저장</button>
//                             </div>
//                             <div class="m-wrap m-items-sorting">
//                                 <div class="m-items-sorting">
//                                     <p>매입가</p>
//                                     <input class="mprice" type="number" name="mprice" placeholder="필수입력" required>
//                                     <select type="text" name="cUnit">
//                                         <option value="원">원</option>
//                                         <option value="달러">달러</option>
//                                         <option value="위안">위안</option>
//                                         <option value="엔">엔</option>
//                                     </select>
//                                     <input class="minPrice" type="number" name="minPrice" hidden readonly>
//                                 </div>
//                                 <div class="m-items-sorting">
//                                     <p>중량</p>
//                                     <input class="mcap" type="number" name="mcap" placeholder="필수입력" required>
//                                     <select class="capUnit" type="text" name="capUnit">
//                                         <option value="Kg">Kg</option>
//                                         <option value="g">g</option>
//                                         <option value="L">L</option>
//                                         <option value="ml">ml</option>
//                                     </select>
//                                     <input class="minCap" type="number" name="minCap" hidden readonly>
//                                     <div class="m-items-sorting">
//                                         <p>메모</p>
//                                         <input type="text" name="mmemo">
//                                     </div>
//                                 </div>
//                             </div>
//                         </form>
//     `;
//         document.querySelector('.add-materials').insertAdjacentHTML('beforeend', newAddHtml);
//     });
// }
//추가 요소 삭제
if (document.querySelector('.add-materials')) {
    document.querySelector('.add-materials').addEventListener('click', function (e) {
        if (e.target.classList.contains('del-item')) {
            // 클릭된 버튼의 부모 양식 찾기
            const parentForm = e.target.closest('form');
            if (parentForm) {
                parentForm.remove()
            }
        }
    });
}
// 재료입력 자세히 입력 열기
if (document.querySelector('.add-materials')) {
    document.querySelector('.add-materials').addEventListener('click', function (e) {
        if (e.target.classList.contains('add-detail-open')) {
            // 클릭된 버튼의 부모 양식 찾기
            const parentForm = e.target.closest('form');
            if (parentForm) {
                // 동일한 양식 내에서 관련된 .add-detail 선택
                const detail = parentForm.querySelector('.add-detail');
                const addDetail = parentForm.querySelector('.add-detail-open');
                if (detail) {
                    detail.classList.remove('hide');
                    addDetail.classList.add('hide');// 세부사항 표시
                }
            }
        }
    });
}
// 재료입력 자세히입력 닫기
if (document.querySelector('.add-materials')) {
    document.querySelector('.add-materials').addEventListener('click', function (e) {
        if (e.target.classList.contains('add-detail-close')) {
            // 클릭된 버튼의 부모 양식 찾기
            const parentForm = e.target.closest('form');
            if (parentForm) {
                // 동일한 양식 내에서 관련된 .add-detail 선택
                const detail = parentForm.querySelector('.add-detail');
                const addDetail = parentForm.querySelector('.add-detail-open');
                if (detail) {
                    detail.classList.add('hide');
                    addDetail.classList.remove('hide');// 세부사항 표시
                }
            }
        }
    });
}
// 상품관리 재료입력 동적추가
// if (document.querySelector('.add-m-p')) {
//     document.querySelector('.add-m-p').addEventListener('click', function () {
//         let newAddHtml = `
//         <div>
//                                 <div class="add-m-more m-wrap m-items-sorting extra-m">
//                                     <div class="m-items-sorting">
//                                         <p>재료명</p>
//                                         <select type="text" name="m-title" placeholder="필수입력"
//                                             style="width : 200px; margin-right: 10px;" required>
//                                             <option></option>
//                                             <% if(materialsData.length=='' ){ %>
//                                                 <option>아직 저장된 재료가 없어요.</option>
//                                                 <option>재료입력에서 재료를 추가해보세요.</option>
//                                                 <% } else { %>
//                                                     <% for (let i=0; i < materialsData.length; i++) { %>
//                                                         <option>
//                                                             <%= materialsData[i].mname %>
//                                                         </option>
//                                                         <% } %>
//                                                             <% } %>
//                                         </select>
//                                     </div>
//                                     <div class="m-items-sorting">
//                                         <p>중량</p>
//                                         <input type="number" name="Mcap" placeholder="필수입력" required>
//                                     </div>
//                                     <div class="m-items-sorting">
//                                         <select>
//                                             <option>g</option>
//                                             <option>ml</option>
//                                         </select>
//                                     </div>
//                                 </div>
//                             </div>
//         `;
//         document.querySelector('.add-m-more').insertAdjacentHTML('beforeend', newAddHtml);
//     });
// }
// 상품입력 재료 삭제버튼
if (document.querySelector('.products-box')){
    document.querySelector('.products-box').addEventListener('click', function(e){
        if (e.target.classList.contains('del-p-m')) {
            // 클릭된 버튼의 부모 양식 찾기
            const parentForm = e.target.closest('.add-products');
            if (parentForm) {
                // 동일한 양식 내에서 관련된 .add-detail 선택
                document.querySelector('.extra-m').remove();
            }
        }
    })
}
// 상품목록 자세히보기
if (document.querySelector('.products-box')) {
    document.querySelector('.products-box').addEventListener('click', function (e) {
        if (e.target.classList.contains('detail-open')) {
            // 클릭된 버튼의 부모 양식 찾기
            const parentForm = e.target.closest('.products-list');
            if (parentForm) {
                // 동일한 양식 내에서 관련된 .add-detail 선택
                const detail = parentForm.querySelector('.products-more');
                const showDetail = parentForm.querySelector('.detail-open');
                if (detail) {
                    detail.classList.remove('hide');
                    showDetail.classList.add('hide');// 세부사항 표시
                }
            }
        }
    });
}
// 상품목록 자세히보기 닫기
if (document.querySelector('.products-box')) {
    document.querySelector('.products-box').addEventListener('click', function (e) {
        if (e.target.classList.contains('detail-close')) {
            // 클릭된 버튼의 부모 양식 찾기
            const parentForm = e.target.closest('.products-list');
            if (parentForm) {
                // 동일한 양식 내에서 관련된 .add-detail 선택
                const detail = parentForm.querySelector('.products-more');
                const showDetail = parentForm.querySelector('.detail-open');
                if (detail) {
                    detail.classList.add('hide');
                    showDetail.classList.remove('hide');// 세부사항 표시
                }
            }
        }
    });
}
// 재료목록 자세히보기
if (document.querySelector('.materials-box')) {
    document.querySelector('.materials-box').addEventListener('click', function (e) {
        if (e.target.classList.contains('detail-open')) {
            // 클릭된 버튼의 부모 양식 찾기
            event.preventDefault();
            const parentForm = e.target.closest('.materials-item');
            if (parentForm) {
                // 동일한 양식 내에서 관련된 .add-detail 선택
                const detail = parentForm.querySelector('.materials-detail');
                const showDetail = parentForm.querySelector('.detail-open');
                if (detail) {
                    detail.classList.remove('hide');
                    showDetail.classList.add('hide');// 세부사항 표시
                }
            }
        }
    });
}
// 재료목록 자세히보기 닫기
if (document.querySelector('.materials-box')) {
    document.querySelector('.materials-box').addEventListener('click', function (e) {
        if (e.target.classList.contains('detail-close')) {
            // 클릭된 버튼의 부모 양식 찾기
            const parentForm = e.target.closest('.materials-item');
            if (parentForm) {
                // 동일한 양식 내에서 관련된 .add-detail 선택
                const detail = parentForm.querySelector('.materials-detail');
                const showDetail = parentForm.querySelector('.detail-open');
                if (detail) {
                    detail.classList.add('hide');
                    showDetail.classList.remove('hide');// 세부사항 표시
                }
            }
        }
    });
}
