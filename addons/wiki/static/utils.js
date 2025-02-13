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
            //nishi
            var test = []
            test.type = node.type
            test.value = node.value
            test.children = []
            for(var i = 0 ; i < node.children.length ; i++){
                if(node.children[i] && node.children[i].type === 'text' && /<span style=\"color/.test(node.children[i].value) && /<\/span>/.test(node.children[i].value)){
                    //var colorName = node.children[i].value.replace(/<span style=\"color: /, '').replace(/\">.*/, '')
                    //var tmp = "<span style=\"color: " + colorName + "\"><\/span>"
                    //test.children.push({ type: 'text' ,value : tmp})
                    //test.children.push({ type: 'text' ,value : node.children[i].value.replace(tmp, '')})
                    var itemData = node.children[i].value.split('<');
                    var textTmp = ""
                    for(var j=0 ; j < itemData.length ; j++){
                        if(itemData[j].startsWith("span style")){
                            textTmp = "<" + itemData[j]
                            test.children.push({type: 'text' ,value : textTmp})
                            textTmp = ""
                        }else if(itemData[j].startsWith("\/span>")){
                            textTmp = "<" + itemData[j]
                            test.children.push({type: 'text' ,value : textTmp})
                            textTmp = ""
                        }else if(itemData[j] !== ""){
                            test.children.push({type: 'text' ,value : itemData[j]})
                        }
                    }
                }else if(node.children[i] && node.children[i].type === 'text' && /<u>/.test(node.children[i].value) && /<\/u>/.test(node.children[i].value)){
                    var itemData = node.children[i].value.split('<');
                    var textTmp = ""
                    for(var j=0 ; j < itemData.length ; j++){
                        if(itemData[j].startsWith("u>")){
                            textTmp = "<" + itemData[j]
                            test.children.push({type: 'text' ,value : textTmp})
                            textTmp = ""
                        }else if(itemData[j].startsWith("/u>")){
                            textTmp = "<" + itemData[j]
                            test.children.push({type: 'text' ,value : textTmp})
                            textTmp = ""
                        }else if(itemData[j] !== ""){
                            test.children.push({type: 'text' ,value : itemData[j]})
                        }
                    }
                }else{
                    test.children.push(node.children[i])
                }
            }
            node = test
            //nishi
            //if (node.children[0] && node.children[0].type === 'text' && /<u>/.test(node.children[0].value)) {
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
                    //Mod Start__
                    //node.children = [underline]
                    // 以降のデータも詰め込む
                    if(cnt < node.children.length-1){
                        //const tailChildren = []
                        //tailChildren.concat(node.children.slice(cnt,-1))
                        const tailChildren = node.children.slice(cnt+1)
                        const xs2 = transform(tailChildren, 0, underline)
                        //Mod Start
                        //for(var i = 0 ; i < xs2[0].length ; i++){
                        //    // ノード数分、ループして詰める
                        //    underline.children.push(xs2[0][i])
                        //}
                        underline.children = underline.children.concat(xs2[0])
                        //Mod End
                    }
                    node.children = [underline]
                    //Mod End
                }
            }else if(node.children[0] && node.children[0].type === 'text' && /<span style=\"color/.test(node.children[0].value)) {
                // 文字色が存在する場合
                var cnt = 0
                for(var i = 0 ; i < node.children.length ; i++) {
                    if(node.children[i].type === 'text' && /<\/span>/.test(node.children[i].value)) {
                        cnt = i
                        break
                    }    
                }
                if(cnt !== node.children.length) {
                    var colorName = node.children[0].value.replace(/<span style=\"color: /, '').replace(/\">.*/, '')
                    if(/.*<\/span>/.test(colorName)){
                        colorName = colorName.replace(/\".*<\/span>/, '')
                    }
                    var tmp = "<span style=\"color: " + colorName + "\">"
                    const colorText = { type: 'colortext' ,color : colorName}
                    var openTags = node.children[0].value.replace(tmp, '')
                    var spanTagsFlg = "0"
                    if(/<span style=\"color:.*/.test(openTags)){
                        // もう一つタグが存在した場合
                        openTags = node.children[0].value.replace(tmp, '').replace(/<span style=\"color:.*>/, '')
                        spanTagsFlg = "1"
                    }
                    const closeTags = node.children[cnt].value.replace(/<\/span>/, '')
                    const remainingChildrentmp = []
                    var remainingChildren = []
                    var openCloseTag =""
                    if (cnt === 0){
                        // 同一ノード内にOpenとCloseがある場合
                        openCloseTag = openTags.replace(/<\/span>/, '')
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
                    colorText.children = out

                    if(spanTagsFlg == "1"){
                        // 同一ノード内に複数存在した場合、変換しなかった分を後続に配列で結合する
                        if(openCloseTag == ""){
                            // 同一ノード内にOpenとCloseがなく、複数開始タグがあった場合（本来存在しない）
                            openCloseTag = openTags
                        }
                        const tailValue = node.children[0].value.replace(tmp + openCloseTag +"<\/span>", '')
                        const tailChildren = { type: 'text' ,value : tailValue}
                        colorText.children = colorText.children.concat(tailChildren)
                        //colorText = colorText.concat(tailChildren)
                    }
                    var tmp2 = []
                    tmp2.push(colorText)
                    if(cnt<node.children.length-1){
                        var out2 = []
                        //const tailChildren = []
                        const tailChildren = node.children.slice(cnt+1)
                        //tailChildren.concat(node.children.slice(cnt,-1))
                        //const xs2 = transform(tailChildren, 0, colorText)
                        //Mod Start
                        var xs2 = [];
                        for(var i = 0 ; i < tailChildren.length ; i++){
                        //    // ノード数分、ループして詰める
                            xs2.push(tailChildren[i])
                        }
                        var xs3;
                        xs3.children = xs2
                        //colorText.children = colorText.children.concat(xs2[0])
                        //colorText = colorText.concat(xs2[0])
                        //tmp.push(colorText)
                        //tmp = tmp.concat(tmp)
                        addTransformedChildren(xs3, i, node, out2);
                        tmp2 = tmp2.concat(out2)
                        //colorText.children = colorText.children.concat(tailChildren)
                        //Mod End
                    }
                    //const xs2 = transform(colorText, i, node);
                    //addTransformedChildren(tmp, i, node, out);
                    //node.children = [colorText]
                    //node.children.push(colorText)
                    node.children = [tmp2]
                    //addTransformedChildren(node, i, null, out);
                    //node.children = [out]

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