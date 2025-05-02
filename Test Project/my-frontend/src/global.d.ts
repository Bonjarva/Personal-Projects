/* eslint-disable @typescript-eslint/no-unused-vars */

export {}; // make this file a module

declare namespace Intl {
  /**
   * Stage-3 API to list ICU values (e.g. timeZone).
   */
  function supportedValuesOf(type: "timeZone"): string[];
}
