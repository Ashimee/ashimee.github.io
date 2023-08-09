(function(Scratch){
    function getCategoryColor(category_id) {
        const bubble = document.querySelector(`.scratchCategoryId-${category_id} .scratchCategoryItemBubble`);  
        const styles = window.getComputedStyle(bubble);
        const backgroundColor = styles.backgroundColor;
        const borderColor = styles.borderColor;
        function rgbToHex(rgb) {
            const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (match) {
                return "#" + match.slice(1).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
            }
            return rgb;
        }
        return {color1: rgbToHex(backgroundColor), color2: rgbToHex(borderColor)};
    }

    class BringBackForI {
        getInfo() {
            return {
                id: '0znzwForI',
                name: 'For I Block',
                color1: getCategoryColor('control').color1,
                color2: getCategoryColor('control').color2,
                menus: {},
                blocks: [
                    {
                        //@ts-expect-error
                        blockType: Scratch.BlockType.XML,
                        xml: `<block id="for_each" type="control_for_each">
                                <value name="VALUE">
                                    <shadow type="math_whole_number">
                                        <field name="NUM">10</field>
                                    </shadow>
                                </value>
                            </block>`
                    }
                ]
            }
        }
    }

    //@ts-expect-error
    Scratch.extensions.register(new BringBackForI());
})(Scratch);