import { ResourceViewConfig } from "linked-data-browser";
import { FileText } from "lucide-react-native";
import { TermPolicyView } from "./TermPolicyView";


export const TermPolicyConfig: ResourceViewConfig = {
  name: "termPolicy",
  displayName: "Term Policy",
  displayIcon: FileText,
  view: TermPolicyView,
  canDisplay: (targetUri) => {
    const path = new URL(targetUri).pathname;
    return (
      path.endsWith(".term-policy.ttl")
    );
  },
};
