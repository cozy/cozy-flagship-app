import { QueryDefinition, HasMany } from 'cozy-client'

const CONTACTS_DOCTYPE = 'io.cozy.contacts'
const FILES_DOCTYPE = 'io.cozy.files'
const BILLS_DOCTYPE = 'io.cozy.bills'

class HasManyBills extends HasMany {
  get data() {
    const refs = this.target.relationships.referenced_by.data
    return refs
      ? refs
          .map(ref => {
            if (ref.type === BILLS_DOCTYPE) {
              return this.get(ref.type, ref.id)
            }
          })
          .filter(Boolean)
      : []
  }

  static query(doc, client, assoc) {
    if (
      !doc.relationships ||
      !doc.relationships.referenced_by ||
      !doc.relationships.referenced_by.data
    ) {
      return null
    }

    const included = doc.relationships.referenced_by.data
    const ids = included
      .filter(inc => inc.type === assoc.doctype)
      .map(inc => inc.id)

    return new QueryDefinition({ doctype: assoc.doctype, ids })
  }
}

// the documents schema, necessary for CozyClient
export default {
  contacts: {
    doctype: CONTACTS_DOCTYPE,
    attributes: {},
    relationships: {}
  },
  files: {
    doctype: FILES_DOCTYPE,
    attributes: {},
    relationships: {
      bills: {
        type: HasManyBills,
        doctype: BILLS_DOCTYPE
      }
    }
  }
}
