'use strict';

function isParent(node) {
    return !!(node && node.children && Array.isArray(node.children));
  }
  
export function isLiteral(node) {
    return !!(node && typeof node.value === 'string');
  }

export function flatMap(ast, fn) {
    return transform(ast, 0, null)[0];

    function transform(node, index, parent) {
        if (isParent(node)) {
            const out = [];
            /*if (node.children[0] && node.children[0].type === 'text' ) {
                if(/<u>/.test(node.children[0].value)) {
                    subTransForm(node, index, parent,"<u>")
                }else if (/<span style=\"color\:/.test(node.children[0].value)) {
                    subTransForm(node, index, parent,"<span style=\"color\:.*>")
                }
            }*/
 
            if (node.children[0] && node.children[0].type === 'text' && /<u>/.test(node.children[0].value)) {
                // 下線が存在する場合
                var cnt = 0
                for(var i = 0 ; i < node.children.length ; i++) {
                    if(node.children[i].type === 'text' && /<\/u>/.test(node.children[i].value)) {
                        cnt = i
                        break
                    }    
                }
                if(cnt !== node.children.length) {
                    const underline = { type: 'underline' }
                    const openTags = node.children[0].value.replace(/<u>/, '')
                    const closeTags = node.children[cnt].value.replace(/<\/u>/, '')
                    const remainingChildrentmp = []
                    var remainingChildren = []
                    if (cnt === 0){
                        // 同一タグ内にOpenとCloseがある場合
                        const openCloseTag = openTags.replace(/<\/u>/, '')
                        if (openTags.length > 0) {remainingChildren.push({ type: 'text', value: openCloseTag})}
                    }else{
                        if (openTags.length > 0) {remainingChildrentmp.push({ type: 'text', value: openTags})}
                        remainingChildren = remainingChildrentmp.concat(node.children.slice(1,cnt))
                        if (closeTags.length > 0) {remainingChildren.push({ type: 'text', value: closeTags})}
                    }
                    //ノードを詰め込む
                    const out = []
                    for (var i = 0, n = remainingChildren.length; i < n; i++) {
                        const nthChild = remainingChildren[i];
                        if (nthChild) {
                            addTransformedChildren(nthChild, i, node, out);
                        }
                    }
                    underline.children = out
                    // 以降のデータも詰め込む
                    if(cnt < node.children.length-1){
                        const tailChildren = node.children.slice(cnt+1)
                        const xs2 = transform(tailChildren, 0, underline)
                        underline.children = underline.children.concat(xs2[0])
                        //Mod End
                    }
                    node.children = [underline]
                    //Mod End
                }
            }else if(node.children[0] && node.children[0].type === 'text' && /<span style=\"color/.test(node.children[0].value)) {
                // 文字色が存在する場合
                var textChildren = []  // 戻りの配列
                // 文字列を分解する
                splitSpanTags(node,0,textChildren,span)
                var cnt = 0
                for(var i = 0 ; i < node.children.length ; i++) {
                    if(node.children[i].type === 'text' && /<\/span>/.test(node.children[i].value)) {
                        // 終わりのタグ位置を調べる
                        cnt = i
                        break
                    }    
                }
                if(cnt !== node.children.length) {
                    var colorName = node.children[0].value.replace(/<span style=\"color: /, '').replace(/\">.*/, '')
                    if(/.*<\/span>/.test(colorName)){
                        colorName = colorName.replace(/\".*<\/span>/, '')
                    }
                    const colorText = { type: 'colortext' ,color : colorName}
                    var openTags = node.children[0].value.replace("<span style=\"color: " + colorName + "\">", '')
                    // 終了タグがある文字列を分割する
                    splitSpanTags(node,cnt,null,"span")
                    // 再度終了タグの場所を探す
                    for(var i = 0 ; i < node.children.length ; i++) {
                        if(node.children[i].type === 'text' && /<\/span>/.test(node.children[i].value)) {
                            // 終わりのタグ位置を調べる
                            cnt = i
                            break
                        }    
                    }
                    const closeTags = node.children[cnt].value.replace(/<\/span>/, '')
                    var remainingChildren = []
                    var openCloseTag ="" 
                    if (cnt === 0){
                        // 同一ノード内にOpenとCloseがある場合
                        openCloseTag = openTags.replace(/<\/span>/, '')
                        if (openTags.length > 0) {remainingChildren.push({ type: 'text', value: openCloseTag})}
                    }else{
                        if (openTags.length > 0) {remainingChildren.push({ type: 'text', value: openTags})}
                        remainingChildren = remainingChildren.concat(node.children.slice(1,cnt))
                        if (closeTags.length > 0) {remainingChildren.push({ type: 'text', value: closeTags})}
                    }
                    
                    //ノードを詰め込む
                    const out = []
                    for (var i = 0, n = remainingChildren.length; i < n; i++) {
                        const nthChild = remainingChildren[i];
                        if (nthChild) {
                            addTransformedChildren(nthChild, i, node, out);
                        }
                    }
                    colorText.children = out

                    // 分解した文字列の残りがあった場合は設定する（色設定の並びに、文字や装飾があった場合）
                    if(textChildren !== ""){
                        textChildren = textChildren.concat(colorText)
                    }else{
                        textChildren = colorText
                    }

                    // 以降のデータも詰め込む
                    if(cnt < node.children.length-1){
                        const tailChildren = node.children.slice(cnt+1)
                        const xs2 = transform(tailChildren, 0, textChildren)
                        textChildren = textChildren.concat(xs2[0])
                    }
                    node.children = textChildren
                }else{
                    // 構文エラー
                }

              } else {

                for (var i = 0, n = node.children.length; i < n; i++) {
                    const nthChild = node.children[i];
                    if (nthChild) {
                        if (nthChild.type === 'text' && /.*!\[.*\]\($/.test(nthChild.value) ) {
                            const remainingChildren = getRemainingNode(i, node.children);
                            const transformedChildren = transformImageSection(remainingChildren);
                            out.push(...transformedChildren)
                            break;
                        } else {
                            addTransformedChildren(nthChild, i, node, out);
                        }
                    }
                }
                node.children = out;
            }
        }
        return fn(node, index, parent);
    }

    function addTransformedChildren(nthChild, i, node, out) {
        const xs = transform(nthChild, i, node);
        if (xs) {
            for (var j = 0, m = xs.length; j < m; j++) {
                const item = xs[j];
                if (item) out.push(item);
            }
        }
    }

  function transformImageSection(remainingChildren) {
      const result = [];
      for (var i = 0; i < remainingChildren.length; i++) {
          if (remainingChildren[i].type === 'text' && /!\[.*\]\($/.test(remainingChildren[i].value)) {
              const imageNode = createImageNode(remainingChildren[i], remainingChildren[i + 1], remainingChildren[i + 2]);
              if (imageNode) {
                  result.push(imageNode);
                  i += 2;
              } else {
                result.push(remainingChildren[i]);
            }
          } else {
              result.push(remainingChildren[i]);
          }
      }
      return result;
  }

  function getRemainingNode(startIdx, nodeChildren) {
      var remainingChildren = [];
      for (var i = startIdx; i < nodeChildren.length; i++) {
          if (nodeChildren[i].type === 'text') {
              if (nodeChildren[i].value.match(/.*!\[.*\]\($/)) {
                  const matchBeforeImage = nodeChildren[i].value.match(/^(.*?)(!\[.*\]\()$/);
                  if (matchBeforeImage[1] !== '') {
                      const beforeImage = matchBeforeImage[1];
                      const matchSize = beforeImage.match(/^(\s*=\d+\))(.*)$/);
                      if (matchSize) {
                          if (matchSize[1] !== '') {
                              remainingChildren.push({ type: 'text', value: matchSize[1] });
                          }
                          if (matchSize[2] !== '') {
                              remainingChildren.push({ type: 'text', value: matchSize[2] });
                          }
                      } else {
                          remainingChildren.push({ type: 'text', value: beforeImage });
                      }
                  }
                  remainingChildren.push({ type: 'text', value: matchBeforeImage[2] });
                  continue;
                } else if (nodeChildren[i].value.match(/^(\s*=\d+\))(.*)/)) {
                  const match = nodeChildren[i].value.match(/^(\s*=\d+\))(.*)/);
                  if (match) {
                      if (match[1] !== '') {
                          remainingChildren.push({ type: 'text', value: match[1] });
                      }
                      if (match[2] !== '') {
                          remainingChildren.push({ type: 'text', value: match[2] });
                      }
                  }
                  continue;
                }
          }
          remainingChildren.push(nodeChildren[i])
      }
      return remainingChildren;
  }
}

function createImageNode(altNode, linkNode, sizeNode) {
    const altTextMatch = altNode.value.match(/^!\[(.*)\]\($/);
    const imageNode = { type: 'image', alt: altTextMatch ? altTextMatch[1] : '', url: '' };

    if (linkNode && linkNode.type === 'link') {
        imageNode.url = linkNode.url;
    }

    if (sizeNode && sizeNode.type === 'text' && /^\s*=\d+%?(x\d*%?)?\)?\s*$/.test(sizeNode.value)) {
        const sizeValue = sizeNode.value.replace(/\)$/, '');
        imageNode.url += sizeValue;
    } else {
        return null;
    }

    return imageNode;
}

function splitTags(node, spritCnt, textChildren, tagText){
    var tmpNode = []
    var itemData = node.children[spritCnt].value.split('<')    // 文字列分割
    var tmpText = ""
    for(var j=0 ; j < itemData.length ; j++){
        if(itemData[j].startsWith(tagText)){
            tmpText = "<" + itemData[j]
        }else if(itemData[j].startsWith("\/" + tagText + ">")){
            tmpText = tmpText + "<\/" + tagText +">"
            tmpNode.push({type: 'text' ,value : tmpText})
            if(itemData[j] !== "\/" + tagText + ">"){
                // 終了タグだけではない場合、終了タグを取り除いた値を設定
                tmpNode.push({type: 'text' ,value : itemData[j].replace("\/" + tagText + ">","")})
            }
            tmpText = ""
        }else if(itemData[j] !== "" && tmpText === ""){
            tmpNode.push({type: 'text' ,value : itemData[j]})
        }else if(itemData[j] !== "" && tmpText !== ""){
            tmpText = tmpText + itemData[j]
        }
    }
    // 残りのノードを詰め込む
    if(tmpText !== "" ){
        tmpNode.push({type: 'text' ,value : tmpText})
    }

    if(!(tmpNode[0].value.startsWith("<"))){
        //最初が文字の場合はそのまま設定
        textChildren.push({ type: 'text', value: tmpNode[0].value})
        node.children[spritCnt].value = node.children[spritCnt].value.replace(tmpNode[0].value,"")
        // 詰め込んだ先頭ノードを削除
        tmpNode.shift();
        Array.prototype.splice.apply(node.children,[spritCnt + 1,0].concat(tmpNode));
        // 分解した配列を削除する
        node.children.splice(spritCnt,1);
        //node.children.shift();
    }else if(tmpNode[0].value.startsWith("<" + tagText)){
        // 開始タグの場合、ノードを付け替える
        node.children = tmpNode.concat(node.children.slice(1))
    }else if(tmpNode[0].value.startsWith("<\/" + tagText)){
        // 終了タグの場合、配列の途中に設定
        Array.prototype.splice.apply(node.children,[spritCnt + 1,0].concat(tmpNode));
        // 分解した配列を削除する
        node.children.splice(spritCnt,1);
    }
}
function subTransForm(node, index, parent, tagText){
    var characterType = ""
    var startTagText = ""
    var closeTagText = ""

    if(/<u>/.test(tagText)){
        // 下線の場合
        characterType = { type: 'underline' }
        startTagText = "<u>"
        closeTagText = "<\/u>"
    }else if(/<span style=\"color/.test(tagText)){
        // 文字色の場合
        var colorName = node.children[0].value.replace(/<span style=\"color: /, '').replace(/\">.*/, '')// 文字色を取得する
        if(/.*<\/span>/.test(colorName)){
            colorName = colorName.replace(/\".*<\/span>/, '')
        }
        characterType = { type: 'colortext' ,color : colorName}
        startTagText = "<span style=\"color: " + colorName + "\">"
        closeTagText = "<\/span>"
    }

    var cnt = 0
    for(var i = 0 ; i < node.children.length ; i++) {
        if(node.children[i].type === 'text' && endTagText.test(node.children[i].value)) {
            cnt = i
            break
        }    
    }
    if(cnt !== node.children.length) {
        const openTags = node.children[0].value.replace(startTagText, '')
        const closeTags = node.children[cnt].value.replace(closeTagText, '')
        const remainingChildrentmp = []
        var remainingChildren = []
        if (cnt === 0){
            // 同一タグ内にOpenとCloseがある場合
            const openCloseTag = openTags.replace(closeTagText, '')
            if (openTags.length > 0) {remainingChildren.push({ type: 'text', value: openCloseTag})}
        }else{
            if (openTags.length > 0) {remainingChildrentmp.push({ type: 'text', value: openTags})}
            remainingChildren = remainingChildrentmp.concat(node.children.slice(1,cnt))
            if (closeTags.length > 0) {remainingChildren.push({ type: 'text', value: closeTags})}
        }
        //ノードを詰め込む
        const out = []
        for (var i = 0, n = remainingChildren.length; i < n; i++) {
            const nthChild = remainingChildren[i];
            if (nthChild) {
                addTransformedChildren(nthChild, i, node, out);
            }
        }
        characterType.children = out
        // 以降のデータも詰め込む
        if(cnt < node.children.length-1){
            const tailChildren = node.children.slice(cnt+1)
            const xs2 = transform(tailChildren, 0, characterType)
            characterType.children = characterType.children.concat(xs2[0])
        }
        node.children = [characterType]
    }
}