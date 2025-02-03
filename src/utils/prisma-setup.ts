import { Prism } from "prism-react-renderer";

declare global {
  interface Window {
    Prism: any;
  }
}

window.Prism = Prism;

require("prismjs/components/prism-abap");
require("prismjs/components/prism-abnf");
require("prismjs/components/prism-actionscript");
require("prismjs/components/prism-ada");
require("prismjs/components/prism-agda");
require("prismjs/components/prism-al");
require("prismjs/components/prism-antlr4");
require("prismjs/components/prism-apacheconf");
require("prismjs/components/prism-apex");
require("prismjs/components/prism-apl");
require("prismjs/components/prism-applescript");
require("prismjs/components/prism-aql");
require("prismjs/components/prism-arduino");
require("prismjs/components/prism-arff");
require("prismjs/components/prism-asciidoc");
require("prismjs/components/prism-asm6502");
require("prismjs/components/prism-asmatmel");
require("prismjs/components/prism-aspnet");
require("prismjs/components/prism-autohotkey");
require("prismjs/components/prism-autoit");
require("prismjs/components/prism-avisynth");
require("prismjs/components/prism-avro-idl");
// ... (other language components as before)
require("prismjs/components/prism-yaml");
require("prismjs/components/prism-yang");
require("prismjs/components/prism-zig");